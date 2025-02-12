ACARS Bridge (command-line version)
===================================

This is a single page webapp version of the ACARS bridge. It can be accessed at
http://acars.skipoles.co.uk. 

Configuration Panel
-------------------
The first panel contains configuration information where the following can be set:

- **SimBrief PilotId** - for IFR flights using SayIntentions.ai, a flight plan must be filed with SimBrief. The ATC call sign contained in the plan is what SayIntentions.ai will use to identify the flight and any ACARS messages associated with that flight.
- **SayIntentions.ai API Key** - the API key used to access the SayIntentions.ai ACARS network. I can be found on the user's profile page.
- **Hoppie.nl ACARS Network** - the API key used to access the Hoppie.nl ACARS network. This is obtained by creating an account at Hoppie.nl.
- **ATSU ID** - the ATSU id of the ATC area that the messages are directed to/from. For SayIntentions.ai this is always `PKGM`.

Configuration values can only be changed when the bridge is not running. The configuration can be saved to local
browser storage and will be pre-populated when the page is reloaded.

Bridge Control Panel
--------------------
The bridge status is displayed here and the bridge can be started and stopped. Start is only available when the 
configuration has been completed. Stop is only available when the bridge is running.

Please only have the bridge running while you are in an active flight. The Hoppie.nl ACARS network is run by a
private individual for free, so minimising the load on that system is important and we don't want to be polling
when there is no flight active.

Message Panels
--------------
The message panels show the messaging being routed by the bridge to both the Airplane and the ATSU. 