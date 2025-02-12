ACARS Bridge
============

The ACARS Bridge provides a way to use Aircraft that are hardcoded to work with the Hoppie.nl ACARS
to interact with Air Traffic Control (ATC) provided by SayIntentions.ai.

In this model, most Aircraft are forced into connecting to the Hoppie.nl ACARS network. Long term, the hope 
is that the location of the ACARS network they connect to will be moved to configuration but, for the time 
being, most are hardcoded to use Hoppie.nl.

The Air Traffic Control (ATC) is being provided by SayIntentions.ai. They provide a fully voice driven
AI implementation of ATC. In addition they also fully support cpdlc for Aircraft-ATC exchange of
non-urgent instructions. However, this only works via the SayIntentions.ai ACARS network.

The bridge works by listening on the Hoppie.nl ACARS network for messages from a specific call sign
that are directed to the SayIntentions.ai ATSU id. When it finds a message, it sends it to the
SayIntentions.ai ACARS network. And visa-versa, it listens on the SayIntentions.ai ACARS network for
messages directed tp the specific call sign and sends them to the Hoppie.nl ACARS network.

The bridge needs the following configuration information:

- **SimBrief PilotId** - for IFR flights using SayIntentions.ai, a flight plan must be filed with SimBrief. The ATC call sign contained in the plan is what SayIntentions.ai will use to identify the flight and any ACARS messages associated with that flight.
- **SayIntentions.ai API Key** - the API key used to access the SayIntentions.ai ACARS network. I can be found on the user's profile page.
- **Hoppie.nl ACARS Network** - the API key used to access the Hoppie.nl ACARS network. This is obtained by creating an account at Hoppie.nl.
- **ATSU ID** - the ATSU id of the ATC area that the messages are directed to/from. For SayIntentions.ai this is always `PKGM`.

Implementations
---------------

I've created two different implementations of the ACARS Bridge using different technologies and approaches:

- The command-line version is a Java/Kotlin command-line application that you have to run locally. The run it you must have a recent Java runtime available.
- The webapp version is a standalone webpage that runs the bridge in a browser window, and therefore needs no downloads or additional software.

Airplane Configuration
----------------------

To use the ACARS networks and bridge, the Airplane needs to be configured correctly with two important parameters:

- **Flight Number** - this is the call sign of the aircraft. Most aircraft that can import flight plans from SimBrief will set this automatically. It **must** match the ATC call sign that SayIntentions.ai obtains from the SimBrief flight plan.
- **ATSU Id** - this is the ATSU area that you want to login to. For SayIntentions.ai this is always `PKGM`.
