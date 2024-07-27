import path from "path"; // Importing the path utility from node.js
import express from "express"; // Importing the express framework
import errorHandler from "errorHandler"; // Importing a custom error handler
import bodyParser from "body-parser"; // Middleware to parse the body of incoming requests
import methodOverride from "method-override"; // Middleware to use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
import logger from "morgan"; // HTTP request logger middleware for node.js
import { fileURLToPath } from "url"; // Utility for converting URL to path
// import { client } from "./config/prismicConfig.js"; // Importing the Prismic client configuration
// import * as prismic from "@prismicio/client";  // Prismic client for fetching API data (commented out)
import PrismicDOM from "prismic-dom"; // Library to facilitate using Prismic content with DOM manipulation
import * as Prismic from "@prismicio/client";

import dotenv from "dotenv"; // Module to load environment variables from a .env file into process.env
// import morgan from "morgan";  // HTTP request logger middleware for node.js (commented out)
import UAParser from "ua-parser-js";

dotenv.config(); // Load environment variables from .env file into process.env

// import prismic  // Related to Prismic API operations (commented out proto code)

const app = express(); // Initializing the express application
const port = process.env.PORT || 3001; // Setting the port for the application with fallback to 3001 if environment variable is not set

app.set("view engine", "pug"); // Setting Pug as the template engine
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Determining the directory name of the module file
// app.use(express.static(path.join(__dirname, "views")));  // Serve static files from the views directory (commented out)

const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
  });
};

const handleLinkResolver = (doc) => {
  // Function to determine the URL path for a given document based on its type
  // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++", doc);  // Debugging output (commented out)
  if (doc.type === "product") {
    return `/detail/${doc.uid}`;
  }
  if (doc.type === "about") {
    return `/about`;
  }
  if (doc.type === "product") {
    // Repeated condition, should handle differently or remove
    return `/detail/${doc.uid}`;
  }
  if (doc.type === "collections_group") {
    return `/collections`;
  }
  return "/";
};
app.use(logger("dev")); // Using morgan's dev format for logging HTTP requests
app.use(bodyParser.json()); // Parsing incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: false })); // Parsing incoming requests with URL-encoded payloads
app.use(methodOverride()); // Allows use of HTTP verbs such as PUT or DELETE
app.use(errorHandler()); // Catching and handling errors globally
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

app.use((req, res, next) => {
  const ua = UAParser(req.headers["user-agent"]);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === "mobile";
  res.locals.isTablet = ua.device.type === "tablet";

  // Custom middleware to add functions and objects to the response locals which are per-request template variables
  res.locals.Link = handleLinkResolver; // Append function to resolve links
  res.locals.Numbers = (index) => {
    // Append function to map numeric indexes to string numbers
    return index == 0
      ? "one"
      : index == 1
      ? "two"
      : index == 2
      ? "three"
      : index == 3
      ? "four"
      : "";
  };

  res.locals.PrismicDOM = PrismicDOM; // Append PrismicDOM library
  next(); // Continue to the next middleware
});

const handleRequest = async (api) => {
  // Asynchronous function to handle common requests and fetch common components
  const home = await api.getSingle("home"); // Fetching the home data from Prismic
  const meta = await api.getSingle("meta"); // Fetching meta data from Prismic
  const preloader = await api.getSingle("preloader"); // Fetching preloader data from Prismic
  const navigation = await api.getSingle("navigation"); // Fetching navigation data from Prismic
  const collections = await api.getAllByType("collections"); // Fetch collections data from Prismic
  const linkedProducts = await api.getAllByType("collections", {
    graphQuery: `{
      collections
        {
          products{
            products_product{
              image
            }
        }
      }
    }`,
  });
  const about = await api.getSingle("about"); // Fetching the about data from Prismic

  // console
  //   .log
  // about,
  // "aboutțttttttttttttttttttttttttttttttttttttttttttttttttt",
  // home,
  // "homeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  // collections,
  // "collectionssssssssssssssssssssssssssssssssssss",
  // linkedProducts
  // "linkedproudctsaognaow;gpnwopgwpognwbogpwbnfpwe"
  // ();

  let assets = [];

  home.data.gallery.forEach((item) => assets.push(item.image.url));

  about.data.gallery.forEach((item) => assets.push(item.image.url));
  about.data.body.forEach((section) => {
    if (section.slice_type === "gallery") {
      section.items.forEach((item) => assets.push(item.image.url));
    }
  });

  linkedProducts.forEach((item) => {
    Object.values(item.data).forEach((product) =>
      product.forEach((linkedProduct) => {
        assets.push(linkedProduct.products_product.data.image.url);
      })
    );
  });

  return {
    assets,
    about,
    collections,
    linkedProducts,
    home,
    meta,
    preloader,
    navigation,
  };
};

app.get("/", async (req, res) => {
  const api = await initApi(req);

  // Route to handle the root URL
  const collections = await api.getAllByType("collections"); // Fetching all collections from Prismic
  const defaults = await handleRequest(api); // Fetching common page components from Prismic
  res.render("pages/home", {
    ...defaults,
    collections,
  });
  // console.log(home.data.gallery[0]);  // Debugging output (commented out)
});

app.get("/about", async (req, res) => {
  const api = await initApi(req);

  // Route to handle "/about" URL
  const defaults = await handleRequest(api); // Fetch common page components from Prismic
  res.render("pages/about", { ...defaults });
});

app.get("/detail/:uid", async (req, res) => {
  const api = await initApi(req);

  // Route to handle detail views dynamically based on UID
  const product = await api.getByUID("product", req.params.uid, {
    fetchLinks: "collections",
  });
  const defaults = await handleRequest(api); // Fetch common page components from Prismic

  const collection = await api.getByUID(
    "collections",
    product.data.collection.uid
  );

  res.render("pages/detail", { product, collection, ...defaults });
});

app.get("/collections", async (req, res) => {
  const api = await initApi(req);
  // Route to handle collections page
  const defaults = await handleRequest(api); // Fetch common page components from Prismic
  res.render("pages/collections", {
    ...defaults,
  });
});

app.listen(port, () => {
  // Start the server and listen on configured port
  console.log(`Example app listening at http://localhost:${port}`); // Console log output for server listening
});
