const moment = require("moment");
const env = require("./env");
const { BlobServiceClient } = require("@azure/storage-blob");
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AMAZON_ORDERS_CONTAINER = process.env.AMAZON_ORDERS_CONTAINER;


if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw Error("Azure Storage Connection string not found");
}
else {
    console.log('AZURE_STORAGE_CONNECTION_STRING: ', AZURE_STORAGE_CONNECTION_STRING);
}



// Get a reference to a container


exports.listContainers = async () => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    let i = 1;
    let containers = blobServiceClient.listContainers();
    for await (const container of containers) {
        console.log(`\nContainer ${i++}: ${container.name}\n`);
    }
};


// Get blob content from position 0 to the end
// In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
// In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
exports.downloadBlockBlobResponse = async (blockBlobClient) => {
    let result = null;
    try {
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        result = await this.streamToString(downloadBlockBlobResponse.readableStreamBody);
        console.log(`\nDownloaded blob content...\n${result}\n`);
        
    }
    catch (err) {
        console.log('err: ', JSON.stringify(err));
    }
    return result;
};

// Convert stream to text
exports.streamToText = async (readable) => {
    let result = null;
    try {
        readable.setEncoding('utf8');
        let data = '';
        for await (const chunk of readable) {
            data += chunk;
        }
        result = data;
    }
    catch (err) {
        console.log('err: ', JSON.stringify(err));
    }
    return result;
};

exports.streamToString = async (readableStream) => {
// async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }


exports.listContainerBlobs = async (container = AMAZON_ORDERS_CONTAINER) => {

    let listContainerBlobsArr = {
        sp_orders_v1: [],
        sp_order_items_v1: []
    };

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient(container);
        console.log("\nListing blobs...");
        let i = 1;

        // List the blob(s) in the container.
        for await (const blob of containerClient.listBlobsFlat()) {

            try {
                let blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                // Display blob name and URL
                console.log(`\n${i}\tname: ${blob.name}\n\tURL: ${blockBlobClient.url}\n`);


                if (blob.name.includes("sp_orders_v1")) {
                    let blobText = await this.downloadBlockBlobResponse(blockBlobClient);
                    listContainerBlobsArr.sp_orders_v1.push({
                        blobName: blob.name,
                        blobUrl: blockBlobClient.url,
                        blobText: blobText
                    });
                }
                if (blob.name.includes("sp_order_items_v1")) {
                    let blobText = await this.downloadBlockBlobResponse(blockBlobClient);
                    listContainerBlobsArr.sp_order_items_v1.push({
                        blobName: blob.name,
                        blobUrl: blockBlobClient.url,
                        blobText: blobText
                    });
                }
                i++;
            }
            catch (err) {
                console.log('loop ERROR in listContainerBlobs: ', JSON.stringify(err));
            }
        }
    }
    catch (err) {
        console.log('ERROR in listContainerBlobs : ', JSON.stringify(err));
    }
    return listContainerBlobsArr;
};

