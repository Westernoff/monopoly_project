window.addEventListener("load", () => {
  const REQUESTS_STORAGE_KEY = "monopoly-project.friend-requests";
  const friendModal = document.getElementById("friendModal");
  const friendBackdrop = document.getElementById("friendBackdrop");
  const friendClose = document.getElementById("friendClose");
  const openFriendModal = document.getElementById("openFriendModal");
  const friendForm = document.getElementById("friendForm");
  const friendNickname = document.getElementById("friendNickname");
  const friendFeedback = document.getElementById("friendFeedback");
  const friendsToast = document.getElementById("friendsToast");
  const friendsToastText = document.getElementById("friendsToastText");
  const friendsNotificationList = document.getElementById("friendsNotificationList");
  let toastTimeoutId = null;

  const getRequests = () => {
    const rawRequests = window.localStorage.getItem(REQUESTS_STORAGE_KEY);

    if (!rawRequests) {
      return [];
    }

    try {
      const parsedRequests = JSON.parse(rawRequests);
      return Array.isArray(parsedRequests) ? parsedRequests : [];
    } catch (error) {
      console.error("Friend requests storage is corrupted", error);
      return [];
    }
  };

  const setRequests = (requests) => {
    window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  };

  const renderRequests = () => {
    const requests = getRequests();

    if (!friendsNotificationList) {
      return;
    }

    if (requests.length === 0) {
      friendsNotificationList.innerHTML =
        '<article class="friend-notification friend-notification-empty"><p>Пока что запросов нет.</p></article>';
      return;
    }

    friendsNotificationList.innerHTML = requests
      .map(
        (request) => `
          <article class="friend-notification">
            <p class="friend-notification-title">${request.nickname}</p>
            <p class="friend-notification-text">Получил уведомление о запросе дружбы.</p>
          </article>
        `,
      )
      .join("");
  };

  const showToast = (message) => {
    if (!friendsToast || !friendsToastText) {
      return;
    }

    friendsToastText.textContent = message;
    friendsToast.removeAttribute("hidden");

    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
      friendsToast.setAttribute("hidden", "");
    }, 2800);
  };

  const openModal = () => {
    if (!friendModal) {
      return;
    }

    friendModal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    if (friendFeedback) {
      friendFeedback.textContent = "";
      friendFeedback.className = "auth-feedback";
    }
    window.setTimeout(() => friendNickname?.focus(), 50);
  };

  const closeModal = () => {
    if (!friendModal) {
      return;
    }

    friendModal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  };

  openFriendModal?.addEventListener("click", openModal);
  friendClose?.addEventListener("click", closeModal);
  friendBackdrop?.addEventListener("click", closeModal);

  friendForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const nickname = friendNickname?.value.trim() ?? "";

    if (!nickname) {
      if (friendFeedback) {
        friendFeedback.textContent = "Введите никнейм друга.";
        friendFeedback.className = "auth-feedback is-error";
      }
      return;
    }

    const requests = getRequests();
    requests.unshift({
      nickname,
      createdAt: Date.now(),
    });
    setRequests(requests);
    renderRequests();

    if (friendFeedback) {
      friendFeedback.textContent = `Запрос для ${nickname} отправлен.`;
      friendFeedback.className = "auth-feedback is-success";
    }

    showToast(`Игрок ${nickname} получил уведомление о запросе дружбы.`);

    window.setTimeout(() => {
      closeModal();
      friendForm.reset();
    }, 450);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && friendModal && !friendModal.hidden) {
      closeModal();
    }
  });

  renderRequests();
  window.setTimeout(openModal, 250);
});
