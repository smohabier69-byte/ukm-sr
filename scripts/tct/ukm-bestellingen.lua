-- @name: UKM Bestellingen
-- @commands: ukmbestel
-- @global: true

--[[
  Stuurt bestellingen van ukm-sr.com automatisch door naar een WhatsApp-nummer.

  Elke minuut haalt deze plugin de nieuwe bestellingen op bij de website,
  stuurt elke bestelling als bericht naar het ingestelde nummer en meldt
  daarna aan de website dat ze is afgeleverd. Valt de bot even uit, dan
  blijven de bestellingen op de website staan en komen ze door zodra de bot
  weer draait.

  Instellen (alleen de eigenaar van de bot, in een privechat met de bot):
    .ukmbestel sleutel <sleutel>   de geheime sleutel; staat ook op Vercel als
                                   BESTELLING_BOT_SLEUTEL. Het bericht met de
                                   sleutel wordt meteen verwijderd.
    .ukmbestel nummer 597xxxxxxx   naar dit nummer gaan de bestellingen
    .ukmbestel test                stuurt een testbericht naar dat nummer
    .ukmbestel status              toont de instellingen en de laatste controle
    .ukmbestel uit / .ukmbestel aan  pauzeren en hervatten
]]

local WEBSITE = "https://ukm-sr.com"

local function instelling(sleutel)
  local waarde = bot.plugin_fetch(sleutel)
  if waarde == nil or waarde == "" then return nil end
  return waarde
end

local function naar_jid(nummer)
  local cijfers = string.gsub(nummer or "", "%D", "")
  if cijfers == "" then return nil end
  -- Lokale Surinaamse nummers (7 cijfers) krijgen de landcode 597.
  if string.len(cijfers) == 7 then cijfers = "597" .. cijfers end
  return cijfers .. "@s.whatsapp.net"
end

local function mag_instellen(msg)
  return msg.is_from_me or bot.is_owner(msg.sender) or bot.is_sudo(msg.sender)
end

local function haal_en_stuur_door()
  local sleutel = instelling("sleutel")
  local jid = naar_jid(instelling("nummer"))
  if not sleutel or not jid then return 0, "niet ingesteld" end

  local headers = { ["Authorization"] = "Bearer " .. sleutel }
  local code, body, err = bot.http_request(WEBSITE .. "/api/bestellingen/openstaand", "GET", headers, nil)
  if err ~= nil and err ~= "" then return 0, "website niet bereikbaar: " .. tostring(err) end
  if code ~= 200 then return 0, "website gaf status " .. tostring(code) end

  local data = bot.json_decode(body)
  if data == nil or data.bestellingen == nil then return 0, "onleesbaar antwoord" end

  local afgeleverd = {}
  for _, bestelling in ipairs(data.bestellingen) do
    bot.send_message(jid, bestelling.bericht)
    table.insert(afgeleverd, bestelling.bestelnummer)
  end

  if #afgeleverd > 0 then
    headers["Content-Type"] = "application/json"
    local melding = bot.json_encode({ bestelnummers = afgeleverd })
    local mcode, _, merr = bot.http_request(WEBSITE .. "/api/bestellingen/afgeleverd", "POST", headers, melding)
    if mcode ~= 200 then
      -- Dan komen ze bij de volgende controle opnieuw; liever dubbel dan gemist.
      bot.log_warn("UKM bestellingen: afmelden mislukt (" .. tostring(mcode) .. " " .. tostring(merr) .. ")")
    end
  end
  return #afgeleverd, nil
end

function on_cron(time)
  if instelling("uit") == "1" then return end
  local aantal, fout = haal_en_stuur_door()
  bot.plugin_store("laatste", bot.format_time(bot.get_time_ms(), "02 Jan 2006 15:04") ..
    (fout and (" - " .. fout) or (" - " .. aantal .. " doorgestuurd")))
end

function on_message(msg)
  if msg.command ~= "ukmbestel" then return end
  if not mag_instellen(msg) then return end

  local actie = msg.args and msg.args[1] or "status"
  local waarde = msg.args and msg.args[2] or nil

  if actie == "sleutel" and waarde then
    bot.plugin_store("sleutel", waarde)
    -- De sleutel hoort niet in de chatgeschiedenis te blijven staan.
    pcall(function() msg.delete() end)
    bot.send_message(msg.chat, "Sleutel opgeslagen.")
  elseif actie == "nummer" and waarde then
    local jid = naar_jid(waarde)
    if not jid then
      bot.send_message(msg.chat, "Dat nummer klopt niet. Voorbeeld: .ukmbestel nummer 5978123456")
      return
    end
    bot.plugin_store("nummer", waarde)
    bot.send_message(msg.chat, "Bestellingen gaan nu naar " .. jid)
  elseif actie == "test" then
    local jid = naar_jid(instelling("nummer"))
    if not jid then
      bot.send_message(msg.chat, "Stel eerst een nummer in: .ukmbestel nummer 597xxxxxxx")
      return
    end
    bot.send_message(jid, "Test van de UKM-bestellingenbot. Nieuwe bestellingen van ukm-sr.com komen in deze chat binnen.")
    bot.send_message(msg.chat, "Testbericht verstuurd naar " .. jid)
  elseif actie == "uit" then
    bot.plugin_store("uit", "1")
    bot.send_message(msg.chat, "Doorsturen gepauzeerd. Nieuwe bestellingen blijven op de website wachten.")
  elseif actie == "aan" then
    bot.plugin_store("uit", "")
    bot.send_message(msg.chat, "Doorsturen staat weer aan.")
  else
    local sleutel = instelling("sleutel")
    local regels = {
      "*UKM bestellingen*",
      "Sleutel: " .. (sleutel and "ingesteld" or "ontbreekt (.ukmbestel sleutel <sleutel>)"),
      "Nummer: " .. (instelling("nummer") or "ontbreekt (.ukmbestel nummer 597xxxxxxx)"),
      "Status: " .. (instelling("uit") == "1" and "gepauzeerd" or "aan"),
      "Laatste controle: " .. (instelling("laatste") or "nog niet"),
    }
    bot.send_message(msg.chat, table.concat(regels, "\n"))
  end
end
