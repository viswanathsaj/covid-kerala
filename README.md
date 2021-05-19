# COVID Kerala
A Telegram bot to notify users of district-wise availability of vaccines and other relevant announcements, information or statistics.

### Configuring a testing environment 

1. Create a bot for testing on botfather and copy the token
2. Make sure you have docker up and running on your machine
3. Create a docker-compose.yml in the root directory of the repository
4. Add the following code snippet to the file replacing <TOKEN> with you bot token.
  
  ```
  version: "3.7"
services: 
  mongodb:
    image: mongo
    ports:
    - "27017:27017"
    container_name: mongodb
    volumes: 
      - "~/mongo/data:/data/db"
  bot:
    environment:
      - TELEGRAM_TOKEN=<TOKEN>
    build: .
    ports:
    - "8080:8080"
    depends_on:
    - mongodb
  ```

5. Run `docker-compose up --build` and the containers should be mounted and the server should start running

*New releses are automatically built and pushed into production*

The production version is currently runninng on **@covidkeralabot**
