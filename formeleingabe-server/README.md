
# Formeleingabe Server

Running

`npm run start`

## Tasks

* client page has controls disabled
* requests a ticket and sets a cookie => enable
* client displays preliminary questions
* then tasks
* then final questions
* content is posted:
  * upload HTML
  * post answers in a json

* Server routes
  * token creation (checks FS for non-existence, creates an empty json with a start date)
  * html upload
  * content-submit
  * result table (protected)
  * html deliver (protected)