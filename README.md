[![Dependency status](https://gemnasium.com/badges/github.com/WhirIO/Server.svg)](https://gemnasium.com/github.com/WhirIO/Server)
[![Alpha](https://img.shields.io/badge/status-alpha-8456AC.svg)](https://github.com/WhirIO/Server)

<p align="center">
  <a href="http://whir.io"><img src="media/whir.png" alt="whir.io" width="420" /></a>
</p>


### Installation

- Clone this repository (navigate to its location),
- copy the `.env.example` to `.env` and fill the required values,
- install what's needed: `npm i`,
- run the application: `npm run local`

**Whir** should now be running on the specified port.

You can also start **whir** with `npm start`. In this case, however, you will need to export the right environment variables. (Same as defined in .env)


### Take it for a spin
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Start chatting as soon as your Heroku instance is deployed:
* Get the **whir** client: `npm i -g whir.io`,
* connect to your server: `whir.io -u [username] -h [your Heroku URL]`,
* enjoy!


### Notes
As you may have noticed, **whir** does not implement an actual HTTPS server, this is because **whir** was mainly written to run on Heroku and Heroku's SSL termination occurs at its load balancers; thus the application remains a non-HTTPS server.

Visit [https://whir.io](https://whir.io) for more information.


### Contribute
```
fork https://github.com/WhirIO/Server
```


### License

[MIT](https://github.com/WhirIO/Server/blob/master/LICENSE)
