(() => {
  console.log("Content script loaded.");

  const sampleUsers = [
    "username",
    "user_name",
    "user",
    "user_id",
    "email",
    "u",
    "roll",
    "roll_no",
    "roll-number",
  ];
  const samplePasswords = [
    "password",
    "pass",
    "pwd",
    "passcode",
    "passphrase",
    "p",
    "pass_id",
  ];
  const sampleSubmit = [
    "submit",
    "login",
    "sign-in",
    "signin",
    "continue",
    "sign_in",
    "log_in",
    "log-in",
    "signup",
    "sign_up",
    "sign-up",
    "register",
    "register_now",
  ];

  const getMatchingElement = (
    nodes,
    sampleArray,
    type,
    searchInnerHTML = false,
  ) => {
    for (let node of nodes) {
      if (searchInnerHTML && node.innerHTML) {
        const innerHTML = node.innerHTML.toLowerCase();
        if (sampleArray.some((users) => innerHTML.includes(users))) return node;
      } else {
        if (!node[type]) continue;
        const name = node[type].toLowerCase();
        if (sampleArray.some((users) => name.includes(users))) return node;
      }
    }
    return null;
  };

  const getSubmit = (nodes) => {
    let element =
      document.querySelector("input[type='submit']") ||
      document.querySelector("button[type='submit']");
    const allButtons = document.getElementsByTagName("button");
    if (!element) {
      element =
        getMatchingElement(nodes, sampleSubmit, "name") ||
        getMatchingElement(nodes, sampleSubmit, "id") ||
        getMatchingElement(nodes, sampleSubmit, "class") ||
        getMatchingElement(nodes, sampleSubmit, "placeholder") ||
        getMatchingElement(nodes, sampleSubmit, "autocomplete") ||
        getMatchingElement(allButtons, sampleSubmit, "innerHTML", true);
    }
    return element;
  };

  const getUserPass = (nodes) => {
    const usernameEl =
      getMatchingElement(nodes, sampleUsers, "name") ||
      getMatchingElement(nodes, sampleUsers, "id") ||
      getMatchingElement(nodes, sampleUsers, "class") ||
      getMatchingElement(nodes, sampleUsers, "placeholder") ||
      getMatchingElement(nodes, sampleUsers, "autocomplete");

    const passwordEl =
      getMatchingElement(nodes, samplePasswords, "name") ||
      getMatchingElement(nodes, samplePasswords, "id") ||
      getMatchingElement(nodes, samplePasswords, "class") ||
      getMatchingElement(nodes, samplePasswords, "placeholder") ||
      getMatchingElement(nodes, samplePasswords, "autocomplete") ||
      getMatchingElement(nodes, samplePasswords, "type");

    return { usernameEl, passwordEl };
  };

  const getElements = () => {
    const nodes = document.getElementsByTagName("input");
    const { usernameEl, passwordEl } = getUserPass(nodes);
    const submitEl = getSubmit(nodes);
    return { usernameEl, passwordEl, submitEl };
  };

  const start = () => {
    const { usernameEl, passwordEl, submitEl } = getElements();
    console.log("Username: ", usernameEl);
    console.log("Password: ", passwordEl);
    console.log("Submit: ", submitEl);
    const checkCredentialElements = usernameEl && passwordEl && submitEl;
    const checkUserElementNotEqualToPasswordElement = usernameEl !== passwordEl;
    const checkUserElementNotEqualToSubmitElement = usernameEl !== submitEl;
    const checkPasswordElementNotEqualToSubmitElement = passwordEl !== submitEl;
    if (
      checkCredentialElements &&
      checkUserElementNotEqualToPasswordElement &&
      checkUserElementNotEqualToSubmitElement &&
      checkPasswordElementNotEqualToSubmitElement
    ) {
      observer.disconnect();
      console.log("Found username, password, and submit elements");
      console.log("Username: ", usernameEl);
      console.log("Password: ", passwordEl);
      console.log("Submit: ", submitEl);
      submitEl.addEventListener("click", () => {
        console.log("Username: ", usernameEl.value);
        console.log("Password: ", passwordEl.value);
        if (usernameEl.value !== "" && passwordEl.value !== "") {
          chrome.runtime.sendMessage(
            {
              type: "save",
              websiteUrl: window.location.href,
              username: usernameEl.value,
              password: passwordEl.value,
            },
            (response) => {
              console.log(response);
            },
          );
        }
      });
    }
  };

  // Create a MutationObserver instance
  const observer = new MutationObserver((mutationsList, observer) => {
    // Handle the changes here
    console.log("DOM changes detected. Running content script...");
    // Call your function or execute your code here
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    start();
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  });

  // Start observing the DOM with specific configuration
  observer.observe(document, { childList: true, subtree: true });
  start();
})();
