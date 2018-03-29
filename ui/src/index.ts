import firebase from "firebase/app";
import { authenticateAuth0, authenticateFirebase } from "./auth";
import { AUTH0_CONFIG, API_BASE_URL } from "./config";
import "./style.css";

window.addEventListener("load", async function() {
  const submitGreat = document.getElementById("submitGreat")!;
  const submitNotThatGreat = document.getElementById("submitNotThatGreat")!;
  const submitNotGreatAtAll = document.getElementById("submitNotGreatAtAll")!;
  const loggingInPage = document.getElementById("loggingInPage")!;
  const homePage = document.getElementById("homePage")!;
  const thankYouPage = document.getElementById("thankYouPage")!;
  const errorPage = document.getElementById("errorPage")!;
  const errorMessage = document.getElementById("errorMessage")!;
  const userId = document.getElementById("userId")!;
  const hideClass = "hidden";

  const hide = (element: HTMLElement) => {
    element.classList.add(hideClass);
  };
  const show = (element: HTMLElement) => {
    element.classList.remove(hideClass);
  };
  const swap = (outgoing: HTMLElement, incoming: HTMLElement) => {
    hide(outgoing);
    show(incoming);
  };

  try {
    const session = await authenticateAuth0({
      ...AUTH0_CONFIG,
      redirectUri: window.location.href
    });
    if (!session) return; // this means an redirect has been issued
    if (!session.user.email) {
      throw new Error("expected user to have email but it did not");
    }
    await authenticateFirebase(session);
    enableFirestore(session.user.email);
    userId.innerText = session.user.email;
    swap(loggingInPage, homePage);
  } catch (err) {
    console.error(err);
    swap(homePage, errorPage);
  }

  function enableFirestore(userId: string) {
    var db = firebase.firestore();

    const saveResponse = (response: string) => {
      db.collection("responses").add({
        respondant: userId,
        response: response,
        instant: new Date().toISOString()
      });
      swap(homePage, thankYouPage);
    };

    submitGreat.onclick = () => saveResponse("great");
    submitNotThatGreat.onclick = () => saveResponse("notThatGreat");
    submitNotGreatAtAll.onclick = () => saveResponse("notGreatAtAll");
  }
});