ACARS Bridge (command-line version)
===================================

This is a command-line version of the ACARS Bridge. It provides a bridge between the Hoppie.nl and
and SayIntentions.ai ACARS networks. 

In order to run the command-line version, you need to have a Java 21 compatible sdk or runtime installed.
Download the release bundle and unpack into a directory somewhere. From the command-line call the 
`run`/`run.bat` script to start the bridge.

Command-line options are:

    --sayIntentionsApiKey, -k -> Say Intentions API key (always required) { String }
    --hoppieApiKey, -l -> Hoppie ACARS API key (always required) { String }
    --simBriefPilotId, -p -> SimBrief Pilot ID (or pass callSign directly) { String }
    --callSign, -c -> Flight call sign (or set SimBrief Pilot ID) { String }
    --atsuId, -a [PKGM] -> ATSU ID (in SayIntentions.ai platform) { String }
    --debug, -d [false] -> Enable debug output 
    --help, -h -> Usage info 
   