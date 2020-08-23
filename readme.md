# BK1031 Status

Custom status service using BK1031 Status API and Statuspage.io

## How it works

The [`monitor.json`](monitor.json) file contains all of the services to track the status for. The monitoring function is run every 5 minutes to check which of the services are online, and which have gone down.

Nodemailer is used to then send update emails to each of the Statuspage service emails. This then causes the service status on the Statuspage update to reflect the current status.

Lastly, discord updates are sent to the log via bot.