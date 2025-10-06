import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";

import "../pages/index.css";

import { setButtonText } from "../utils/helpers.js";

import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },

  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },

  {
    name: "Restaurant Terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },

  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },

  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },

  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },

  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "719221f7-1d93-4e17-ac7c-2ee672701f16",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    // Handle cards
    cards.forEach(function (item) {
      const card = getCardElement(item);
      cardsList.append(card);
    });

    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.src = userData.avatar;
    // profileIdEl = userData.id; // Add when ready
  })
  .catch(console.error);

//Edit profile form elements
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editAvatarBtn = document.querySelector(".profile__avatar-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileFormEl = editProfileModal.querySelector(".modal__form");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

//Avatar form elements

const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseBtn = editAvatarModal.querySelector(".modal__close-btn");
const editAvatarFormEl = editAvatarModal.querySelector(".modal__form");
const editAvatarInput = editAvatarModal.querySelector("#profile-image-input");

//Card form elements
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const newPostFormEl = newPostModal.querySelector(".modal__form");
const newPostImageInput = newPostFormEl.querySelector("#card-image-input");
const newPostCaptionInput = newPostFormEl.querySelector(
  "#card-description-input"
);
let selectedCard;
let selectedCardId;

//Delete form elements
const deleteCardModal = document.querySelector("#delete-image-modal");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");

//Card elements
const cardTemplate = document.querySelector("#card-template");

const cardsList = document.querySelector(".cards__list");

//Image preview elements
const previewModal = document.querySelector("#image-preview-modal");
const previewCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// ========== UTILITY FUNCTIONS ==========
function handleEscapeKey(evt) {
  if (evt.key === "Escape") {
    const openModal = document.querySelector(".modal_is-opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

// ========== CARD FUNCTIONS ==========
function handleLike(evt, id) {
  const isLiked = evt.target.classList.contains("card__like-btn_active");
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_active");
    })

    .catch((error) => {
      console.error("Failed to change like status:", error);
    });
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  //trashcan button on card
  cardDeleteBtnEl.addEventListener("click", (evt) =>
    handleCardDelete(evt, cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    (previewImageEl.src = data.link), (previewImageEl.alt = data.name);
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));

  return cardElement;
}

// delete card
function handleCardDelete(evt, cardElement, cardId) {
  evt.preventDefault();
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteCardModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  if (!selectedCardId) {
    console.error("No card ID selected for deletion");
    return;
  }
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      if (selectedCard) {
        selectedCard.remove();
      }
      closeModal(deleteCardModal);
      // Reset the selected variables
      selectedCard = null;
      selectedCardId = null;
    })
    .catch((error) => {
      console.error("Failed to delete card:", error);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleNewPostFormSubmit(evt) {
  evt.preventDefault();
  const newPostInputValues = {
    name: newPostCaptionInput.value,
    link: newPostImageInput.value,
  };
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .addCard(newPostInputValues)
    .then((newCardData) => {
      const card = getCardElement(newCardData);
      cardsList.prepend(card);

      newPostFormEl.reset();
      disableButton(newPostSubmitBtn, validationConfig);
      closeModal(newPostModal);
    })
    .catch((error) => {
      console.error("Failed to create card:", error);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

// ========== PROFILE FUNCTIONS ==========
function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then(({ name, about }) => {
      profileNameEl.textContent = name;
      profileDescriptionEl.textContent = about;
      closeModal(editProfileModal);
    })
    .catch((error) => {
      console.error("Failed to save:", error);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

// ========== AVATAR FUNCTIONS ==========
function handleAvatarFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .updateAvatar({ avatar: editAvatarInput.value })
    .then(({ avatar }) => {
      profileAvatarEl.src = avatar;

      closeModal(editAvatarModal);
    })
    .catch((error) => {
      console.error("Failed to save avatar:", error);
    })
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

// ========== EVENT LISTENERS ==========
// Modal overlay click listeners
const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("click", function (evt) {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

// Profile event listeners
editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(
    editProfileFormEl,
    [editProfileNameInput, editProfileDescriptionInput],
    validationConfig
  );
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

editProfileFormEl.addEventListener("submit", handleProfileFormSubmit);

// Avatar event listeners
editAvatarBtn.addEventListener("click", function () {
  openModal(editAvatarModal);
});

editAvatarCloseBtn.addEventListener("click", function () {
  closeModal(editAvatarModal);
});

editAvatarFormEl.addEventListener("submit", handleAvatarFormSubmit);

// Card event listeners
newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

newPostFormEl.addEventListener("submit", handleNewPostFormSubmit);

// Delete card modal event listeners
deleteCardForm.addEventListener("submit", handleDeleteSubmit);

const deleteCardModalCloseBtn =
  deleteCardModal.querySelector(".modal__close-btn");
const deleteCancelBtn = deleteCardModal.querySelector(
  ".modal__button_type_cancel"
);

deleteCardModalCloseBtn.addEventListener("click", function () {
  closeModal(deleteCardModal);
  // Reset selected card variables
  selectedCard = null;
  selectedCardId = null;
});

deleteCancelBtn.addEventListener("click", function () {
  closeModal(deleteCardModal);
  // Reset selected card variables
  selectedCard = null;
  selectedCardId = null;
});

// Preview modal event listeners
previewCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

enableValidation(validationConfig);
