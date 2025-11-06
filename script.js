/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const productSearch = document.getElementById("productSearch");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* --- Product selection logic --- */

// Helper: get selected product IDs from localStorage
function getSelectedProductIds() {
  const stored = localStorage.getItem("selectedProductIds");
  return stored ? JSON.parse(stored) : [];
}

// Helper: save selected product IDs to localStorage
function setSelectedProductIds(ids) {
  localStorage.setItem("selectedProductIds", JSON.stringify(ids));
}

// Helper: get all products from localStorage for selected IDs
async function getSelectedProducts() {
  const allProducts = await loadProducts();
  const selectedIds = getSelectedProductIds();
  return allProducts.filter((product) => selectedIds.includes(product.id));
}

// Render selected products below the grid
async function renderSelectedProducts() {
  // Find the container for selected products
  const selectedProductsList = document.getElementById("selectedProductsList");
  if (!selectedProductsList) return;

  const selectedProducts = await getSelectedProducts();

  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `<div class="placeholder-message">No products selected yet.</div>`;
    return;
  }

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="product-card selected" style="min-width:220px; position:relative;">
        <img src="${product.image}" alt="${product.name}">
        <span class="product-info-icon" tabindex="0">
          <img src="img/Minimalist_info_Icon.png" alt="Info" style="width:100%;height:100%;">
        </span>
        <span class="product-info-icon-tooltip">Click to learn more about this product</span>
        <div class="product-card-overlay" style="display:flex;">
          <button class="product-card-overlay-close" aria-label="Close">&times;</button>
          <div>
            <h3 style="color:#fff;margin-bottom:10px;">${product.name}</h3>
            <p style="color:#fffbe6;font-weight:500;margin-bottom:10px;">${product.brand}</p>
            <p style="color:#fff;">${product.description}</p>
          </div>
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
        </div>
      </div>
    `
    )
    .join("");

  // Add overlay logic for selected products list
  Array.from(
    document
      .getElementById("selectedProductsList")
      .getElementsByClassName("product-card")
  ).forEach((card) => {
    let infoIcon = card.querySelector(".product-info-icon");
    let overlay = card.querySelector(".product-card-overlay");
    let closeBtn = card.querySelector(".product-card-overlay-close");

    infoIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.add("show-overlay");
      infoIcon.style.display = "none";
    });

    infoIcon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.add("show-overlay");
        infoIcon.style.display = "none";
      }
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.remove("show-overlay");
      infoIcon.style.display = "";
    });

    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}

// Create HTML for displaying product cards
function displayProducts(products) {
  const selectedIds = getSelectedProductIds();

  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card${
      selectedIds.includes(product.id) ? " selected" : ""
    }" 
         data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <span class="product-info-icon" tabindex="0">
        <img src="img/Minimalist_info_Icon.png" alt="Info" style="width:100%;height:100%;">
      </span>
      <span class="product-info-icon-tooltip">Click to learn more about this product</span>
      <div class="product-card-overlay" style="display:flex;">
        <button class="product-card-overlay-close" aria-label="Close">&times;</button>
        <div>
          <h3 style="color:#fff;margin-bottom:10px;">${product.name}</h3>
          <p style="color:#fffbe6;font-weight:500;margin-bottom:10px;">${
            product.brand
          }</p>
          <p style="color:#fff;">${product.description}</p>
        </div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");

  // Add click event to each card for selection/deselection
  Array.from(productsContainer.getElementsByClassName("product-card")).forEach(
    (card, idx) => {
      const productId = Number(card.getAttribute("data-product-id"));
      let infoIcon = card.querySelector(".product-info-icon");
      let overlay = card.querySelector(".product-card-overlay");
      let closeBtn = card.querySelector(".product-card-overlay-close");

      // Info icon click: show overlay
      infoIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        card.classList.add("show-overlay");
        // Change icon to X (hide info icon image, show close button)
        infoIcon.style.display = "none";
      });

      // Info icon keyboard accessibility (Enter key)
      infoIcon.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.add("show-overlay");
          infoIcon.style.display = "none";
        }
      });

      // Close overlay
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        card.classList.remove("show-overlay");
        infoIcon.style.display = "";
      });

      // Prevent overlay click from selecting/deselecting product
      overlay.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Card click: select/deselect product
      card.addEventListener("click", async (event) => {
        // Only select/deselect if not clicking info icon or overlay
        if (
          event.target.classList.contains("product-info-icon") ||
          event.target.classList.contains("product-card-overlay") ||
          event.target.classList.contains("product-card-overlay-close")
        ) {
          return;
        }
        let selectedIds = getSelectedProductIds();

        if (selectedIds.includes(productId)) {
          // Deselect
          selectedIds = selectedIds.filter((id) => id !== productId);
          card.classList.remove("selected");
        } else {
          // Select
          selectedIds.push(productId);
          card.classList.add("selected");
        }
        setSelectedProductIds(selectedIds);
        await renderSelectedProducts(); // Update selected products below
      });
    }
  );

  // Always update selected products below when displaying products
  renderSelectedProducts();
}

// Store the latest search and category filter values
let currentCategory = "";
let currentSearch = "";

// Helper: filter products by category and search keyword
function filterProducts(products, category, search) {
  let filtered = products;
  if (category) {
    filtered = filtered.filter((product) => product.category === category);
  }
  if (search) {
    const keyword = search.trim().toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.brand.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
    );
  }
  return filtered;
}

// Update product grid based on current filters
async function updateProductGrid() {
  const products = await loadProducts();
  const filteredProducts = filterProducts(
    products,
    currentCategory,
    currentSearch
  );
  displayProducts(filteredProducts);
}

// Listen for category changes
categoryFilter.addEventListener("change", async (e) => {
  currentCategory = e.target.value;
  await updateProductGrid();
});

// Listen for product search input changes
if (productSearch) {
  productSearch.addEventListener("input", async (e) => {
    currentSearch = e.target.value;
    await updateProductGrid();
  });
}

/* --- Chatbot Integration --- */
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements for chatbot
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");

  // Check if required DOM elements exist
  if (!chatForm || !userInput || !chatWindow) {
    alert(
      "Error: Missing chatForm, userInput, or chatWindow element. Please check your HTML IDs."
    );
    return;
  }

  // Create a display for the latest user question above the chat window
  let userQuestionDisplay = document.getElementById("user-question-display");
  if (!userQuestionDisplay) {
    userQuestionDisplay = document.createElement("div");
    userQuestionDisplay.id = "user-question-display";
    chatWindow.parentNode.insertBefore(userQuestionDisplay, chatWindow);
  }

  // Friendly greetings for variety
  const greetings = [
    "👋 Welcome! Ask me about hair care products or your future skincare routine.",
    "✨ Hi there! Curious about L'Oreal products or routines? Just ask!",
    "😊 Hello! I'm here to help with all your L'Oreal beauty questions.",
  ];

  // Helper function to add a message bubble to the chat window
  function addMessageBubble(content, sender) {
    const bubble = document.createElement("div");
    bubble.classList.add("msg");
    bubble.classList.add(sender === "user" ? "user" : "ai");
    bubble.innerHTML = content.replace(/\n/g, "<br>");
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Show a random greeting on page load
  chatWindow.innerHTML = "";
  addMessageBubble(
    greetings[Math.floor(Math.random() * greetings.length)],
    "bot"
  );
  userQuestionDisplay.textContent = "";

  // Cloudflare Worker endpoint
  const workerUrl = "https://chatbot-worker.u1381801.workers.dev/";

  // Conversation history for multi-turn context
  const conversation = [
    {
      role: "system",
      content: `You are a friendly and helpful assistant who's an expert on L'Oreal products. 
You help people find the best skincare and haircare routines based on their needs. 
Your responses should be concise, informative, and include current information about L'Oréal products or routines using agentic web search with reasoning. 
If relevant, include links or citations to sources you find. 
You always refer to L'Oreal's official website for product details and avoid making up information. 
If you don't know the answer, you politely say you don't know and ask for more details about their skincare or haircare needs. 
Politely refuse to answer questions unrelated to L'Oreal products, routines, recommendations, beauty-related topics, makeup, or skincare advice.`,
    },
  ];

  // Async function to call the Cloudflare Worker with full conversation history
  async function callCloudflareWorker() {
    addMessageBubble("Thinking...🤔", "bot");
    try {
      const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversation }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      // The Cloudflare Worker wraps the OpenAI response inside 'data'
      const aiData = data.data;

      if (
        !aiData ||
        !aiData.choices ||
        !aiData.choices[0] ||
        !aiData.choices[0].message ||
        !aiData.choices[0].message.content
      ) {
        addMessageBubble(
          "Sorry, I didn't get a valid response from the AI. Please try again.",
          "bot"
        );
        return;
      }

      const aiReply = aiData.choices[0].message.content.trim();
      conversation.push({ role: "assistant", content: aiReply });

      // Remove loading indicator
      const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
      if (loadingMsg && loadingMsg.textContent === "Thinking...🤔") {
        chatWindow.removeChild(loadingMsg);
      }

      addMessageBubble(aiReply, "bot");
    } catch (error) {
      const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
      if (loadingMsg && loadingMsg.textContent === "Thinking...🤔") {
        chatWindow.removeChild(loadingMsg);
      }
      addMessageBubble(
        "Sorry, something went wrong. Please try again later.",
        "bot"
      );
      console.error("Error:", error);
    }
  }

  // Handle form submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const prompt = userInput.value.trim();
    if (!prompt) return;

    conversation.push({ role: "user", content: prompt });
    addMessageBubble(prompt, "user");
    userQuestionDisplay.textContent = prompt;
    userInput.value = "";
    callCloudflareWorker();
  });
});

// Helper: get selected products info for routine
async function getSelectedProductsInfo() {
  const selectedProducts = await getSelectedProducts();
  return selectedProducts.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: p.description,
  }));
}

// Handle Generate Routine button click
const generateBtn = document.querySelector(".generate-btn");
if (generateBtn) {
  generateBtn.addEventListener("click", async () => {
    // Show loading message in chat
    addMessageBubble("Generating your personalized routine...✨", "bot");

    // Get selected products info
    const selectedProductsInfo = await getSelectedProductsInfo();

    if (selectedProductsInfo.length === 0) {
      addMessageBubble(
        "Please select at least one product to generate a routine.",
        "bot"
      );
      return;
    }

    // Add a user message to conversation with selected products JSON
    conversation.push({
      role: "user",
      content:
        `Here are the products I've selected:\n` +
        JSON.stringify(selectedProductsInfo, null, 2) +
        `\nPlease create a personalized beauty routine using these products.`,
    });

    // Call the AI routine generator
    await callCloudflareWorker();
  });
}

// On page load, restore selected products if any
document.addEventListener("DOMContentLoaded", async () => {
  // If a category is already selected, show products and restore selection
  if (categoryFilter && categoryFilter.value) {
    const products = await loadProducts();
    const filteredProducts = products.filter(
      (product) => product.category === categoryFilter.value
    );
    displayProducts(filteredProducts);
  }

  // Set initial filter values
  currentCategory =
    categoryFilter && categoryFilter.value ? categoryFilter.value : "";
  currentSearch =
    productSearch && productSearch.value ? productSearch.value : "";
  await updateProductGrid();

  // Always render selected products on load
  await renderSelectedProducts();
});
