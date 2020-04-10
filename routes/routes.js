const checksum_lib = require("../utils/checksum");
const shortid = require("shortid");
const Product = require("../model/Product");
const Order = require("../model/Order");
const request = require("request");
module.exports = function(app) {
  //home page
  app.get("/", (req, res) => {
    res.render("index");
  });
  app.get("/aboutus", (req, res) => {
    res.render("about");
  });
  //post product
  app.post("/addproduct", async (req, res) => {
    const { name, imgFront, imgBack, price, exclusive } = req.body;
    try {
      const product = new Product({
        name,
        price,
        imgFront,
        imgBack,
        exclusive
      });

      product.save();
      return res.json({
        msg: "product added"
      });
    } catch (error) {
      console.log(error);
    }
  });
  //limted product page
  app.get("/exclusiveproduct", (req, res) => {
    res.render("limitedProduct");
  });

  //order placed
  app.get("/orderplaced", (req, res) => {
    res.render("orderPlaced");
  });
  //size chart
  app.get("/sizechart", (req, res) => {
    res.render("sizechart");
  });
  //order Details
  app.get("/orderdetails", (req, res) => {
    res.render("orderDetails");
  });

  //track order
  app.post("/trackorder", async (req, res) => {
    const { orderid } = req.body;
    if (req.body["g-recaptcha-response"] == "") {
      return res.render("error", {
        error: "Captcha verification failed. Try again"
      });
    }
    const secretKey = process.env.CPSECKEY;

    const verificationURL =
      "https://www.google.com/recaptcha/api/siteverify?secret=" +
      secretKey +
      "&response=" +
      req.body["g-recaptcha-response"] +
      "&remoteip=" +
      req.connection.remoteAddress;
    request(verificationURL, async function(error, response, body) {
      if (body.success !== undefined && !body.success) {
        return res.render("error", {
          error: "Captcha verification failed. Try again"
        });
      }
      try {
        const order = await Order.findOne({
          orderId: orderid
        }).populate("product");
        if (!order) {
          return res.render("error", {
            error: "Order not found. Please check your Order Id."
          });
        }
        return res.render("orderDetails", order);
      } catch (error) {
        console.log(error);
        return res.render("error", {
          error: "Something went wrong. Try again."
        });
      }
    });
  });

  //order Details
  app.get("/checkorder", (req, res) => {
    res.render("checkOrder", {
      sitekey: process.env.CPSITEKEY
    });
  });

  //contact
  app.get("/contact", (req, res) => {
    res.render("contact");
  });

  //order checkout
  app.get("/checkout", (req, res) => {
    res.render("checkout");
  });

  app.get("/product", async (res, req) => {
    try {
      const product = await Product.find({});
      res.status(200).json(product);
    } catch (error) {
      return res.render("error", {
        error: "Something went wrong. Try again."
      });
    }
  });

  //payment gateway

  //POST checkout
  app.post("/order", async (req, res) => {
    console.log(req.body);
    const {
      email,
      phone,
      channelid,
      name,
      amount,
      hostel,
      roomNo,
      size
    } = req.body;

    try {
      const custID = name + shortid.generate();
      const orderID = shortid.generate();
      const newOrder = await new Order({
        name,
        phone,
        hostel,
        roomNo,
        email,
        size,
        orderId: orderID,
        custId: custID,
        productName: "Engineering Things | Black Solid Hoodie",
        product: "5db42397b4208c3e906777e2"
      });
      await newOrder.save();

      var params = {};
      params["MID"] = process.env.MID;
      params["WEBSITE"] = "DEFAULT";
      params["CHANNEL_ID"] = channelid;
      params["INDUSTRY_TYPE_ID"] = "Retail";
      params["ORDER_ID"] = orderID + new Date().getTime();
      params["CUST_ID"] = custID;
      params["TXN_AMOUNT"] = "250";
      params["CALLBACK_URL"] = process.env.CALLBACKURL;
      params["EMAIL"] = email;
      params["MOBILE_NO"] = phone;

      checksum_lib.genchecksum(params, process.env.PKEY, async function(
        err,
        checksum
      ) {
        if (err) console.log("paytm", err);

        var txn_url = "https://securegw.paytm.in/order/process";

        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
          form_fields +=
            "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }

        newOrder.checkhash = checksum;
        await newOrder.save();
        form_fields +=
          "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, {
          "Content-Type": "text/html"
        });
        res.write(
          '<html><head><title>Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
            txn_url +
            '" name="f1">' +
            form_fields +
            '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
        );
        res.end();
      });
    } catch (error) {
      return res.render("error", {
        error: "Something went wrong. Try again."
      });
    }
  });

  // Callback

  app.post("/callback", async (req, res) => {
    console.log("callback", req.body);
    const orderid = req.body.ORDERID.substring(0, 9);
    const {
      ORDERID,
      TXNID,
      TXNAMOUNT,
      STATUS,
      RESPMSG,
      PAYMENTMODE,
      TXNDATE,
      GATEWAYNAME,
      BANKTXNID,
      BANKNAME
    } = req.body;

    const check = checksum_lib.verifychecksum(
      req.body,
      process.env.PKEY,
      req.body.CHECKSUMHASH
    );
    if (check) {
      try {
        const order = await Order.findOne({
          orderId: orderid
        }).exec();

        order.orderId = ORDERID;
        order.trasactionId = TXNID;
        order.amount = TXNAMOUNT;
        order.status = STATUS;
        order.resMsg = RESPMSG;
        order.paymentMode = PAYMENTMODE;
        order.transactionDate = TXNDATE;
        order.gatewayCode = GATEWAYNAME;
        order.bankTXNID = BANKTXNID;
        order.bankName = BANKNAME;

        await order.save();
        console.log("order", order);

        return res.render("orderPlaced", order);
      } catch (error) {
        return res.render("error", {
          error:
            "Transaction Failed. If any amount debited from your account will be refunded. Chill"
        });
      }
    } else {
      return res.render("error", {
        error:
          "Transaction Failed. If any amount debited from your account will be refunded. Chill"
      });
    }
  });
};
