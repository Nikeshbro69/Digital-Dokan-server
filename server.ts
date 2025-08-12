import adminSeeder from "./adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import categoryController from "./src/controllers/categoryController";

function startServer(){
    const port = envConfig.port || 4000;
    
    app.listen(port, ()=>{
        console.log(`Server started on port[${port}]`)
        categoryController.seedCatgory();
        adminSeeder();
    })

}

startServer();