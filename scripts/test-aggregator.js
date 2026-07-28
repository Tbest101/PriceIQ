// test-aggregator.js
// This script simulates fetching real-time grocery prices using the SerpApi Google Shopping API.
// To run with real data, set your SERPAPI_KEY environment variable:
// export SERPAPI_KEY="your_free_key_here"
// node test-aggregator.js

async function fetchGroceryPrices(query) {
  const apiKey = process.env.SERPAPI_KEY;

  console.log(`\n🛒 Looking up real-time prices for: "${query}"...\n`);

  if (!apiKey) {
    console.log("⚠️ No SERPAPI_KEY found in environment. Using a local mock response for demonstration.");
    console.log("Get a free key at https://serpapi.com/ and set it to see live data.\n");
    return simulateSerpApiResponse();
  }

  // Real API fetching logic
  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.append("engine", "google_shopping");
    url.searchParams.append("q", query);
    url.searchParams.append("api_key", apiKey);
    // Location can also be added e.g., "Austin, Texas"
    url.searchParams.append("location", "United States");

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    
    // We only care about the shopping_results array for this test
    return data.shopping_results || [];
  } catch (error) {
    console.error("❌ Failed to fetch from SerpApi:", error.message);
    return [];
  }
}

function simulateSerpApiResponse() {
  // This JSON precisely mimics the structure returned by SerpApi's Google Shopping engine
  return [
    {
      position: 1,
      title: "Organic Bananas, 2 lb Bag",
      source: "Walmart",
      price: "$1.48",
      extracted_price: 1.48,
      currency: "$",
      thumbnail: "https://example.com/banana_walmart.jpg",
      delivery: "In stock at nearest store"
    },
    {
      position: 2,
      title: "Target Market Pantry Organic Bananas - 2lbs",
      source: "Target",
      price: "$1.59",
      extracted_price: 1.59,
      currency: "$",
      thumbnail: "https://example.com/banana_target.jpg",
      delivery: "Same Day Delivery Eligible"
    },
    {
      position: 3,
      title: "Organic Fair Trade Bananas, Bunch",
      source: "Whole Foods Market via Amazon",
      price: "$2.29",
      extracted_price: 2.29,
      currency: "$",
      thumbnail: "https://example.com/banana_wholefoods.jpg",
      delivery: "Delivery by 2 PM"
    }
  ];
}

async function runSandbox() {
  const results = await fetchGroceryPrices("organic bananas");

  console.log("✅ Results Array:");
  console.dir(results.slice(0, 3), { depth: null }); // Show top 3 results
  
  if (results.length > 0) {
      console.log(`\n💡 Data Integration Concept for Less4More:`);
      console.log(`Our OptimizationEngine would receive this JSON and instantly map:`);
      results.slice(0, 3).forEach(item => {
          console.log(` - ${item.source}: ${item.price}`);
      });
  }
}

runSandbox();
