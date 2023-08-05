# Setup file template to upload data to MongoDB Atlas
mongoimport --uri "mongodb://ac-v15ieft-shard-00-00.t5h1nlk.mongodb.net:27017,ac-v15ieft-shard-00-01.t5h1nlk.mongodb.net:27017,ac-v15ieft-shard-00-02.t5h1nlk.mongodb.net:27017/qkart?replicaSet=atlas-2vuecc-shard-0" --ssl --authenticationDatabase admin --username abhishekm2106 --password abhishekmohanty --drop --collection users --file data/export_qkart_users.json
mongoimport --uri "mongodb://ac-v15ieft-shard-00-00.t5h1nlk.mongodb.net:27017,ac-v15ieft-shard-00-01.t5h1nlk.mongodb.net:27017,ac-v15ieft-shard-00-02.t5h1nlk.mongodb.net:27017/qkart?replicaSet=atlas-2vuecc-shard-0" --ssl --authenticationDatabase admin --username abhishekm2106 --password abhishekmohanty --drop --collection products --file data/export_qkart_products.json\



