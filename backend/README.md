**Channel Connector**

**1.** **Installation**

 1.1 Download and install node js from [*https://nodejs.org/en/download/*](https://nodejs.org/en/download/)

 1.2 Create a directory/folder in your drive and extract the zip files there.
 1.3 Open CMD->go to project folder->run   **npm install**

**Note:** npm install will get package information from package.json and load all the packages need to run the project in node\_modules folder.

 1.4 After installing node\_modules run ***npm start***

If babel-node not works properly try installing **babel-cli** globally. To do that

run   **npm install --global babel-cli**

**2.** **Database**

 Database: **fby\_channel**

 **Common Table**

 **2.1** Table structure for table **users**
  Fby user details with unique fby\_user\_id.

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|name|varchar(50)|Yes|NULL|
|email|varchar(50)|Yes|NULL|
|**fby\_user\_id**|varchar(128)|Yes|NULL|
|auth\_username|varchar(128)|Yes|NULL|
|auth\_password|varchar(128)|Yes|NULL|
|created\_at|datetime|No|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|

**2.2** Table structure for table **products**

**Products getting from channels are stored here with unique** **fby\_user\_id** and **sku**.

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|**fby\_user\_id**|varchar(128)|Yes|NULL|
|domain|varchar(64)|Yes|NULL|
|**sku**|varchar(128)|Yes|NULL|
|barcode|varchar(128)|Yes|NULL|
|item\_id|varchar(127)|Yes|NULL|
|title|varchar(128)|Yes|NULL|
|item\_product\_id|varchar(127)|Yes|NULL|
|inventory\_item\_id|varchar(127)|Yes|NULL|
|previous\_inventory\_quantity|int(11)|Yes|NULL|
|inventory\_quantity|int(11)|Yes|NULL|
|image|text|Yes|NULL|
|price|decimal(10,2)|Yes|NULL|
|count|int(11), UNSIGNED|No|0|
|fby\_error\_flag|Int(11), UNSIGNED|No|0|
|status|tinyint(4)|No|0|
|cron\_name|varchar(60)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|created\_at|datetime|No|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|

**2.3**Table structure for**table**temp\_master\_inventory

 Product details getting from **FBY** are stored here with unique **sku\_id**

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|**sku\_id**|varchar(128)|Yes|NULL|
|skucode|varchar(128)|Yes|NULL|
|barcode|varchar(128)|Yes|NULL|
|quantity|int(11)|Yes|NULL|
|priority|int(11)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|created\_at|datetime|No|CURRENT\_TIMESTAMP|

**2.4** Table structure for table **order\_masters**

 All total details of an order are stored in **order\_masters** table

|**Column**|**Type**|**Null**|**Default**|
| :- | :- | :- | :- |
|***id***|int(10)|No||
|channel|varchar(256)|Yes|NULL|
|channel\_code|varchar(20)|Yes|NULL|
|fby\_user\_id|varchar(128)|Yes|NULL|
|account\_id|int(11)|Yes|NULL|
|**order\_no**|varchar(256)|Yes|NULL|
|seller\_order\_id|varchar(100)|Yes|NULL|
|purchase\_date|datetime|Yes|NULL|
|payment\_date|datetime|Yes|NULL|
|local\_time|datetime|Yes|NULL|
|SalesChannel|varchar(50)|Yes|NULL|
|shipping\_method|varchar(256)|Yes|NULL|
|recipient\_name|varchar(256)|Yes|NULL|
|ship\_company|varchar(256)|Yes|NULL|
|ship\_address\_1|varchar(256)|Yes|NULL|
|ship\_address\_2|varchar(256)|Yes|NULL|
|ship\_city|varchar(256)|Yes|NULL|
|ship\_state|varchar(64)|Yes|NULL|
|ship\_state\_code|varchar(4)|Yes|NULL|
|ship\_postal\_code|varchar(256)|Yes|NULL|
|ship\_country|varchar(256)|Yes|NULL|
|ship\_country\_code|varchar(20)|Yes|NULL|
|ship\_phone\_number|varchar(256)|Yes|NULL|
|total\_order|decimal(10,2)|Yes|NULL|
|total\_items|int(11)|Yes|NULL|
|total\_items\_price|decimal(10,2)|Yes|NULL|
|total\_shipping\_price|decimal(10,2)|Yes|NULL|
|total\_shipping\_tax|decimal(10,2)|Yes|NULL|
|total\_tax|decimal(10,2)|Yes|NULL|
|total\_discount|decimal(10,2)|Yes|NULL|
|payment\_transaction\_id|varchar(256)|Yes|NULL|
|payment\_method|varchar(256)|Yes|NULL|
|currency\_code|varchar(20)|Yes|NULL|
|buyer\_id|varchar(128)|Yes|NULL|
|buyer\_email|varchar(256)|Yes|NULL|
|buyer\_name|varchar(256)|Yes|NULL|
|product\_details|text|Yes|NULL|
|sales\_record\_no|varchar(128)|Yes|NULL|
|payment\_status|varchar(20)|Yes|NULL|
|order\_status|varchar(20)|Yes|NULL|
|is\_canceled|tinyint(4)|No|0|
|fby\_send\_status|tinyint(4)|Yes|0|
|count|int(11)|No|0|
|fby\_error\_flag|tinyint(4)|No|0|
|cron\_name|varchar(60)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|created\_at|datetime|Yes|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|

**2.5** Table structure for table **order\_details**

Each item details of an order are stored in **order\_details** table.

|**Column**|**Type**|**Null**|**Default**|
| :- | :- | :- | :- |
|***id***|int(10)|No||
|channel|varchar(10)|Yes|NULL|
|channel\_code|varchar(20)|Yes|NULL|
|fby\_user\_id|varchar(128)|Yes|NULL|
|account\_id|int(11)|Yes|NULL|
|**order\_no**|varchar(256)|Yes|NULL|
|location\_id|varchar(256)|Yes|NULL|
|seller\_order\_id|varchar(100)|Yes|NULL|
|purchase\_date|datetime|Yes|NULL|
|payment\_time|datetime|Yes|NULL|
|**order\_line\_item\_id**|varchar(256)|Yes|NULL|
|**sku**|varchar(256)|Yes|NULL|
|barcode|varchar(128)|Yes|NULL|
|**order\_item\_id**|varchar(128)|Yes|NULL|
|transaction\_id|varchar(128)|Yes|NULL|
|product\_name|varchar(256)|Yes|NULL|
|brand|varchar(128)|Yes|NULL|
|available\_stock|int(11)|Yes|0|
|quantity\_purchased|int(11)|Yes|NULL|
|currency|varchar(10)|Yes|NULL|
|exchange\_rate|float|Yes|NULL|
|item\_price|decimal(10,2)|Yes|NULL|
|line\_item\_price|decimal(10,2)|No|0.00|
|item\_tax|decimal(10,2)|Yes|NULL|
|item\_total\_tax|decimal(10,2)|Yes|NULL|
|promotion\_discount|decimal(10,2)|Yes|NULL|
|item\_total\_price|decimal(10,2)|Yes|NULL|
|item\_total\_ship\_price|decimal(10,2)|Yes|NULL|
|tracking\_courier|varchar(256)|Yes|NULL|
|tracking\_id|varchar(256)|Yes|NULL|
|tracking\_url|text|Yes|NULL|
|is\_trackable|tinyint(4)|Yes|0|
|cron\_name|varchar(60)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|status|tinyint(4)|No|0|
|created\_at|datetime|Yes|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|

**Channel Account Table**

**2.6** Table structure for table **shopify\_account**

**This table stores the Shopify user credentials with unique**fby\_user\_id **and** domain.

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|**fby\_user\_id**|varchar(128)|Yes|NULL|
|**domain**|varchar(64)|Yes|NULL|
|api\_key|varchar(255)|Yes|NULL|
|api\_password|varchar(255)|Yes|NULL|
|channel\_code|varchar(20)|Yes|NULL|
|currency\_code|varchar(20)|Yes|NULL|
|created\_at|datetime|No|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|

**Cron Tables**

**2.7** Table structure for table **cron\_process\_table**

**
cron\_process\_table store cron status for each api hit

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|fby\_user\_id|varchar(128)|Yes|NULL|
|cron\_name|varchar(60)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|created\_at|datetime|Yes|CURRENT\_TIMESTAMP|
|updated\_at|datetime|Yes|NULL|
|status|tinyint(4)|No|0|

**2.8** Table structure for table **cron\_error\_log**

**
cron\_error\_log table store the error logs occurred while processing the api request.

|**Column**|**Type**|**Null**|**Default**|
| - | - | - | - |
|***id***|int(11)|No||
|fby\_user\_id|varchar(128)|Yes|NULL|
|cron\_name|varchar(60)|Yes|NULL|
|cron\_id|varchar(100)|Yes|NULL|
|type\_error|varchar(60)|Yes|NULL|
|error\_message|text|Yes|NULL|
|created\_at|datetime|No|CURRENT\_TIMESTAMP|

**Mapping Tables**

**2.9** Table structure for table **map\_channel\_alert\_code**

**
This table stores channel and FBY alert maping codes

|**Column**|**Type**|**Null**|**Default**|
| :- | :- | :- | :- |
|***id***|int(11)|No||
|channel|varchar(50)|Yes|NULL|
|ch\_alert\_code|varchar(100)|Yes|NULL|
|fby\_alert\_code|varchar(100)|Yes|NULL|

**2.10** Table structure for table **map\_channel\_cancel\_reason**

**
This table stores channel and FBY cancelation reason codes

|**Column**|**Type**|**Null**|**Default**|
| :- | :- | :- | :- |
|***id***|int(11)|No||
|channel|varchar(50)|Yes|NULL|
|ch\_cancel\_reason|varchar(128)|Yes|NULL|
|fby\_cancel\_reason|varchar(128)|Yes|NULL|

**2.11** Table structure for table **map\_channel\_payment\_method**

**
This table stores channel and FBY payment method codes

|**Column**|**Type**|**Null**|**Default**|
| :- | :- | :- | :- |
|***id***|int(10)|No||
|channel|varchar(50)|Yes|NULL|
|ch\_payment\_method|varchar(100)|Yes|NULL|
|fby\_payment\_method|varchar(100)|Yes|NULL|

**3.** **Stored Procedure**

**3.1 get\_user():**

Takes fby\_user\_id as parameter and search user matched with this id.

**3.2**  **getShopifyUser():**

  Takes fby\_user\_id as parameter and search account matched with this id.

Product

**3.3**  **getProductByStatus():**

**
Takes fby\_user\_id as parameter and search product details matched with this id and status=0.

**3.4**  **getProductByDomain():**

**
Takes fby\_user\_id and domain as parameter and search product details matched with this id and domain.

**3.5**  **addProduct():**

This stores the product details in **products** table coming from different channels.

**3.6**  **addStock():**

**
This stores the product details in**temp\_master\_inventory** coming from FBY Stock List.

**3.7**  **updateProduct():**

**
This updates product quantity in**products**table fetching details from**temp\_master\_inventory**where sku of both table matches and product quantity of**products**table not equal to quantity of**temp\_master\_inventory.**

**3.8**  **updateProductStatus():**

This updates product status to 1 after sending products to FBY.

**3.9 updateProdLocation():**

**
This updates each product location\_id fetching from channel.

**3.10 getProductByFlag():**

**
This will get products having fby\_error\_flag=1, count=1 and  cron\_name passing through the parameter.

**3.11 getProductBySku():**

**
This will get products as per fby\_user\_id and sku.

**3.12 updateProductCron():**

**
This is used to update the sending cron status in products table while sending products to FBY.

Order

**3.13 addOrderMasters():**

**
Stores an order total details

**3.14 addOrderDetails():**

Stores an order’s all line items detail.

**3.15 getOrderByAccount():**

**
This will get order from order\_masters table where its account\_id matches with the channel incremental id.

**3.16 getOrderByStatus():**

This will get order from order\_masters table where fby\_send\_status=0.

**3.17 getOrderByFlag():**

This will get order from order\_masters table where fby\_error\_flag=1,count=1 and cron\_name matches with the parameter given.

**3.18 getOrderDetails():**

This will get line\_item details from order\_details table where fby\_user\_id and order\_no matches with the parameters given.

**3.19 getOrderDetailsTracking():**

This will get line\_item details from order\_details table having is\_trackable=1 where fby\_user\_id and order\_no matches with the parameters given. It basically checks if a item have tracking details or not.

**3.20 getUntrackOrders():**

This will get order number from order\_details table having is\_trackable=0 where fby\_user\_id and channel name matches with the parameters given. It basically gets those order numbers which have no tracking details.

**3.21 getCanceledOrderDetails():**
**
This procedure get canceled orders from order\_details table where payment\_status="**partially\_refunded**" or "**refunded**”, is\_canceled\_fby=0 and the channel, channel\_code,  account\_id,fby\_user\_id matches with the parameter given.

**3.22 getLocationId():**
**
To get location\_id from products table where sku and fby\_user\_id matches with the parameter given.

**3.23 updateOrder():**

**
This will update tracking details in order\_details table and order status in order\_masters table.

**3.24 updateOrderCancel():**

This will update is\_canceled\_fby to 1 in order\_details table and is\_canceled\_fby=1, fby\_send\_status=1 in  order\_masters table.

**3.25 updateOrderCancelStatus():**

**
This will update payment\_status, order\_status, cancel\_reason, is\_canceled\_fby=0 in order\_details table and payment\_status, order\_status, is\_canceled=0 in order\_masters table

**3.26 updateOrderCron():**

This is used to update the sending cron status in order\_masters table while sending orders to FBY.

**3.27 updateOrderDetailStatus():**

This is used to set the status 1in order\_details table after successfully sending tracking details to Channel.

**3.28 updateOrderStatus():**

This is used to set fby\_send\_status=1 after successfully sending the order to FBY.

Cron

**3.29**  **insertCron():**

This takes fby\_user\_id, cron name, cron id and 1 as parameter and insert into **cron\_process\_table** with status 1marking as running.

**3.30**  **updateCron():**

This takes current time and cron id as parameter and update **cron\_process\_table** with status 0 marking as finished where given cron id matches and status =1.

**3.31**  **cronErrorLog():**

This takes fby\_user\_id, cron name, cron id, type of error and error message as parameter and insert these into **cron\_error\_log** table.

Error Management

**3.32**  **getAlertCode():**
**
This will get mapped alert codes from**map\_channel\_alert\_code** table

**3.33**  **fbyOrderErrorManage():**

This will check if a given cron parameter already exist or not in order\_masters table. If exist then it will increase the count by one. If not exist then it will make flag to 1, count to 1 and update new cron status.

**3.32**  **fbyProductErrorManage():**

This is same as **fbyOrderErrorManage().**

**4.** **Project Structure**

- **server:**
  - **constants**
    - **common.js:** common methods
    - **constants.js:** all the constants
    - **email.js :** mail templates
    - **mailer.js :** mail package to send mail
  - **controller**
    - **fbyController.js:** controller for fby api
    - **commonApiController.js:** controller for storing common fby constants
    - **errorManageController.js:** controller for sending alerts
    - **shopifyController.js:** controller for shopify channel
  - **database**
    - **dbConnection.js:** MySql connection
  - **routes**
    - **router.js:** all routing for API request
  - **services**
    - **render.js**
- **.env**
- **.babelrc**
- **config.js:** configured .env file
- **index.js:** entry page
- **package.json:** all the node package dependencies list

The starting point of the project is index.js. When API requests it will call route methods from router.js.

1. **APIs**

**Shopify Channel**

base url**: [*http://localhost:3000/shopify/api/*](http://localhost:3000/shopify/api/)**

**Products**

1. **base url/get\_shopify\_products?fby\_user\_id=1002**

**T**o get products from Shopify Channel

**Flow:**

When API calls, it will go through router.js and call a function **getShopifyProducts(req, res)** through shopifyController. It takes url request and send response.

In **getShopifyProducts()** first**it will insert cron name ‘**get\_Shopify\_Products**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will search in **shopify\_account** table. If exists then it will get all the credentials like api key, api password, domain from **shopify\_account** table to get products from Shopify Channel.

To do so it will call an asynchronous function **getProducts()**  which call the shopify API, get products and store all the product details with fby\_user\_id, domain, cron name, cron id in **products** table.

After finish, **cron\_process\_table** will update and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/** **get\_shopify\_location?fby\_user\_id=1002**

**T**o get products location id

**Flow:**

When API calls, it will go through router.js and call a function **getShopifyLocation (req, res)** through shopifyController. It takes url request and send response

In **getShopifyLocation ()** first**it will insert cron name ‘**Get\_Shopify\_Location**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will loop through the **shopify\_account** table and get the shopify user deails and then it will loop through **products** table having same fby\_user\_id and domain as per the shopify\_account table. Then it will call **getLocationShopify()** function to get location id,

**getLocationShopify()** takes product and shopify details and call the shopify api to get location id. On success this will update location\_id in products table using **updateProdLocation()** procedure and on fail it will store the log in db.

After finish, **cron\_process\_table** will update and set status to 0 as it finished processing.

1. **base url/send\_products\_fby?fby\_user\_id=1002**

**T**o send products to FBY

**Flow:**

When API calls, it will go through router.js and call a function **sendProductsFby (req, res)** through shopifyController. It takes url request and send response

In **sendProductsFby ()** first**it will insert cron name ‘**send\_Products\_Fby**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will search in **Products** table having same fby\_user\_id as in **users** table and having status 0. If exists then it will get all the product details like sku, barcode etc from **products** table to send it to Fby.

Before that it will check if the cron\_name with “send\_Products\_Fby” already exist or not. If exist then it will use the existing cron\_id to process the further operation otherwise it will update new cron\_id and cron\_name to the products table

to send it will call two functions **getFBYToken()** and **insertSku()** from fbyCotroller.

**getFBYToken():**
**
This function takes user details as parameter and gets the JWT token from FBY and send token as a call back response to channel controller

**insertSku():**

- This function takes jwt\_token, product details,exist\_cron as parameter and send product details to FBY.
- After successfully sending details it will  update the status of products table to 1 to mark sent.
- After all the products sent ,it will send a json as a callback response to channel controller.

On the process of sending while any error occurs then it will update the products table flag and count. If the cron already exist then it will increase the count otherwise it will make the fby\_error\_flag=1 using **fbyProductErrorManage()** procedure

After finishing  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/get\_fby\_stock?fby\_user\_id=1002**

**T**o get skus from FBY

**Flow:**

When API calls, it will go through router.js and call a function **getFbyStock(req, res)** through shopifyController. It takes url request and send response.

In **getFbyStock ()** first**it will insert cron name ‘**get\_Fby\_Stock**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check if the updated\_after parameter. If updated\_after is not blank and not satisfied with the date format then it will send error response. If all ok then it will check fby\_user\_id in '**users**' table, if exists then it will get all the user credentials like user name, user password from **users** table required to get token from fby.

To do so it will call two functions **getFBYToken()** and **getStockList()** from fbyCotroller.

**getFBYToken():**
**
This function takes user detail as parameter and get the JWT token from FBY and send token as  a call back response to channel controller

**getStockList():**

- This function takes jwt\_token, shopify\_account detail,http request body as parameter and get product details from FBY.
- After successfully getting product data it will  insert these data in **temp\_master\_inventory** table.
- After all the data inserted ,it will update new product quantity in **products** table and send a json as a callback response to channel controller.

After finished  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/push\_stock\_shopify?fby\_user\_id=1002**

**T**o update inventory in shopify channel

**Flow:**

When API calls, it will go through router.js and call a function **pushStockShopify (req, res)** through shopifyController. It takes url request and send response.

In **pushStockShopify()** first**it will insert cron name ‘**push\_Stock\_Shopify**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in '**users**' table, if exists then it will search in ' **shopify\_account**' table. If exists then it will get all the credentials like api key, api password, domain from **shopify\_account** table for shopify api. Then for each shopify account get product details from products table having same fby\_user\_id and domain which were got from **shopify\_account** table.

To send product sku to shopify it will call an asynchronous function **pushProductsShopify()** .It takes product details and shopify user details as parameter and call the shopify API to update inventory.

After finishing  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

**Orders**

1. **base url/** **get\_shopify\_orders?fby\_user\_id=1002**

To get orders from shopify

**Flow:**

When API calls, it will go through router.js and call a function **getShopifyOrders(req, res)** through shopifyController. It takes url request and send response.

In **getShopifyOrders()** first**it will insert cron name ‘**get\_Shopify\_Orders**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will search in **shopify\_account** table. If exists then it will get all the credentials like api key, api password, domain from **shopify\_account** table to get orders from Shopify Channel. To do so it will call **getOrders().**

**getOrders()** takes shopify\_account details as parameter and call shopify api to get orders having status ‘any’ and updated\_at\_min as 2days before current date.On successful response it will check the financial\_status and fulfillment\_status of the order.

If the financial\_status is **paid** and fulfillment\_status is **null** then it will store the total order details in **order\_masters** table and each line\_item details in **order\_details** tale.

If the financial\_status is **refunded or partially\_** **refunded (**consider as **Canceled)** then it will update order\_details and order\_masters table’s payment\_status,order\_status, canceled staus using **updateOrderCancelStatus()** procedure.

After finish, **cron\_process\_table** will update and set status to 0 as it finished processing.

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/** **send\_orders\_fby?fby\_user\_id=1002**

**T**o send orders to FBY

**Flow:**

When API calls, it will go through router.js and call a function **sendOrdersFby (req, res)** through shopifyController. It takes url request and send response

In **sendOrdersFby()** first**it will insert cron name ‘**send\_Orders\_Fby**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will search in **order\_masters** table having same fby\_user\_id as in **users** table and having fby\_send\_status 0. If exists then it will get all the order details to send it to Fby.

Before that it will check if the cron\_name with “send\_Orders\_Fby” already exist or not. If exist then it will use the existing cron\_id to process the further operation otherwise it will update new cron\_id and cron\_name to the products table

to send order will call two functions **getFBYToken()** and **insertOrder()** from fbyCotroller.

**getFBYToken():**
**
This function takes user details as parameter and gets the JWT token from FBY and send token as a call back response to channel controller

**insertOrder():**

- This function takes jwt\_token, order details,exist\_cron as parameter and send order details to FBY.
- After successfully sending details it will update the fby\_send\_status of order\_masters table to 1 to mark sent.
- After all the orders sent, it will send a json as a callback response to channel controller.

On the process of sending while any error occurs then it will update the order\_masters table flag and count. If the cron already exist then it will increase the count otherwise it will make the fby\_error\_flag=1 using **fbyOrderErrorManage()** procedure

After finishing  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/** **send\_canceled\_orders\_fby?fby\_user\_id=1002**

**T**o send orders to FBY

**Flow:**

When API calls, it will go through router.js and call a function **sendCanceledOrdersFby (req, res)** through shopifyController. It takes url request and send response

In **sendCanceledOrdersFby()** first**it will insert cron name ‘**send\_Canceled\_Orders\_Fby**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table, if exists then it will search in **shopify\_account** table. If exists then it will search in **order\_details** table through **getCanceledOrderDetails()** procedure. If exists then it will get all the order details to send it to Fby.

To send canceled order will call two functions **getFBYToken()** and **insertCanceledOrder()** from fbyCotroller.

**getFBYToken():**
**
This function takes user details as parameter and gets the JWT token from FBY and send token as a call back response to channel controller

**insertCanceledOrder ():**

- This function takes jwt\_token, order details,shopify\_account details as parameter and send canceled order\_details to FBY.
- After successfully sending details it will update the cancel status in order\_details and order\_masters table using **updateOrderCancel()** procedure.
- After all the orders sent, it will send a json as a callback response to channel controller.

After finishing  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/** **get\_track\_number?fby\_user\_id=1002**

**T**o get tracking numbers from FBY

**Flow:**

When API calls, it will go through router.js and call a function **getFbyTraknumber (req, res)** through shopifyController. It takes url request and send response

In **getFbyTraknumber()** first**it will insert cron name ‘**get\_track\_number**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in **users** table. If exists then it will search in **order\_details** table through **getUntrackOrders()** procedure. If exists then it will get the order number from order\_details table.

To send canceled order will call two functions **getFBYToken()** and **getTrackList()** from fbyCotroller.

**getFBYToken():**
**
This function takes user details as parameter and gets the JWT token from FBY and send token as a call back response to channel controller

**getTrackList ():**

- This function takes jwt\_token, order number as parameter and get tracking details of the given order number as parameter to FBY.
- After successfully getting tracking details it will update the tracking status, tracking url, tracking number, tracking carrier in order\_details table and order\_status="fulfiled" in order\_masters table using **updateOrder()** procedure.
- After tracking details get successfully, it will send a json as a callback response to channel controller.

After finishing  **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **base url/** **push\_traks\_shopify?fby\_user\_id=1002**

**T**o update fulfillment (update tracking number) in shopify channel

**Flow:**

When API calls, it will go through router.js and call a function **pushTrackShopify(req, res)** through shopifyController. It takes url request and send response.

In **pushTrackShopify()** first**it will insert cron name ‘**push\_Track\_Shopify**’ and cron id in**cron\_process\_table** and set status to 1.

Then check if the given url have fby\_user\_id or not. If present then it will check fby\_user\_id first in '**users**' table, if exists then it will search in ' **shopify\_account**' table. If exists then it will get all the credentials like api key, api password, domain from **shopify\_account** table for shopify api. Then for each shopify account get order details from order\_masters table having same fby\_user\_id and account\_id having same **shopify\_account** id which were got from **shopify\_account** table.

To send tracking details to shopify it will call an asynchronous function **pushTrackingShopify ()** .It takes order details and shopify user details as parameter. Then it gets all order details from order\_details table having is\_trackable=1 and status=0 and call the shopify API to update tracking details.

After finishing **cron\_process\_table** will updated and set status to 0 as it finished processing.

**Log store:**

During this process if any error occurs, then log will be stored in **cron\_error\_log** table.

1. **commonApiController**

This controller used to fetch fby constant APIs data and to store that data in database. The fetching process is based on switch case. According to case provided in url the api will be called for that case.

**base url:** http://localhost:3000/api/fby\_apis?fby\_user\_id=1002

  **fby\_user\_id** field is mandatory

1. **base url&case=payment\_method\_code**

This gets payment\_method\_code from fby and store in **fby\_payment\_method** table

1. **base url&case=** **cancel\_reason**

This gets cancel\_reason\_code from fby and store in **fby\_** **cancel\_reason** table

1. **base url&case=** **alert\_codes**

This gets alert\_codes from fby and store in **fby\_alert\_codes** table

1. **base url&case=** **alert\_domains**

This gets alert\_domains\_code from fby and store in **fby\_alert\_domains** table

1. **base url&case=** **channel\_codes**

This gets channel\_codes from fby and store in **fby\_channel\_codes** table

1. **base url&case=** **currency\_codes**

This gets currency\_codes from fby and store in **fby\_currency\_codes** table

1. **Node Packages**

**axios & request-promise:** used to call API.

**dotenv :** to access .env constants.

**ejs:** used to generate HTML markup with plain JavaScript.

**express:** Defines routing which is used to perform different actions based on HTTP Method and URL.

**mysql:** for mysql database connectivity.

**node-datetime:** to create timestamp.

**moment:** to check date format and to create two days before date from current date.

**nodemailer:** to send mail.

**uuid:** to create unique cron id.

**nodemon:** to start server automatically on changes in js files.

**babel:** to execute ES6 syntax into code that works in current browsers.
