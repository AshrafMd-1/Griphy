const clearEl = document.querySelector("#clear");
const loginEl = document.querySelector("#login");
const selectEl = document.querySelector("#select");
const errorEl = document.querySelector("#error");
const imgDivEl = document.querySelector("#img");

let password = [];

clearEl.addEventListener("click", clearAll);
loginEl.addEventListener("click", loginAll);

function clearAll() {
  password = [];
  selectEl.innerText = password.length;
  selectEl.style.color = "black";
  errorEl.textContent = "";
  loginEl.disabled = true;
  const imgs = document.querySelectorAll("img");
  imgs.forEach((img) => {
    img.style.border = "none";
    img.addEventListener("click", select);
  });
}

function loginAll() {
  if (password.length > 4) {
    errorEl.textContent = "Only 4 images can be selected.";
  } else {
    chrome.runtime.sendMessage(
      { type: "login", password: password.join("") },
      function (response) {
        console.log("this is the response", response);
        if (response) {
          location.href = "../detail/detail.html";
        } else {
          clearAll();
          errorEl.textContent = "Login failed.";
        }
      },
    );
  }
}

function loadImg() {
  const url = "../images/";
  const imageIndices = shuffleArray([...Array(9).keys()]); // Generate an array of shuffled indices

  for (const index of imageIndices) {
    const img = document.createElement("img");
    img.src = url + (index + 1) + ".png";
    img.id = (index + 1).toString();
    img.addEventListener("click", select);
    imgDivEl.appendChild(img);
  }
}

function shuffleArray(array) {
  // Fisher-Yates shuffle algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function select(event) {
  if (password.length < 4) {
    password.push(event.target.id);
    event.target.style.border = "2px solid red";
    event.target.removeEventListener("click", select);
    selectEl.innerText = password.length;
    if (password.length === 4) {
      selectEl.innerText += " (OK)";
      selectEl.style.color = "green";
      loginEl.disabled = false;
    }
  } else {
    errorEl.textContent = "Only 4 images can be selected.";
  }
}

function defaultBehavior() {
  loadImg();
  loginEl.disabled = true;
}

defaultBehavior();
