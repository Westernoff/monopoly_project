window.addEventListener("load", () => {
  const ACCOUNTS_STORAGE_KEY = "monopoly-project.accounts";
  const SESSION_STORAGE_KEY = "monopoly-project.session";
  const intro = document.getElementById("intro");
  const authModal = document.getElementById("authModal");
  const authBackdrop = document.getElementById("authBackdrop");
  const authClose = document.getElementById("authClose");
  const authForm = document.getElementById("authForm");
  const authFeedback = document.getElementById("authFeedback");
  const loginInput = document.getElementById("loginInput");
  const passwordInput = document.getElementById("passwordInput");
  const gameModeModal = document.getElementById("gameModeModal");
  const gameModeBackdrop = document.getElementById("gameModeBackdrop");
  const gameModeClose = document.getElementById("gameModeClose");
  const playBotsButton = document.getElementById("playBotsButton");
  const searchGameButton = document.getElementById("searchGameButton");
  const gameModeFeedback = document.getElementById("gameModeFeedback");
  const startGameButton = document.getElementById("startGameButton");
  const heroStartButton = document.getElementById("heroStartButton");
  const statusBanner = document.getElementById("statusBanner");
  const debugTrigger = document.getElementById("debugTrigger");
  const profileButton = document.getElementById("profileButton");
  let hasAutoOpenedAuth = false;
  let bannerTimeoutId = null;
  let pendingStartGame = false;

  const getAccountsDb = () => {
    const rawAccounts = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);

    if (!rawAccounts) {
      const defaultAccounts = [
        {
          login: "admin",
          password: "admin",
          role: "admin",
        },
      ];

      window.localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(defaultAccounts),
      );

      return defaultAccounts;
    }

    try {
      const parsedAccounts = JSON.parse(rawAccounts);

      if (Array.isArray(parsedAccounts) && parsedAccounts.length > 0) {
        return parsedAccounts;
      }
    } catch (error) {
      console.error("Accounts storage is corrupted", error);
    }

    const fallbackAccounts = [
      {
        login: "admin",
        password: "admin",
        role: "admin",
      },
    ];

    window.localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(fallbackAccounts),
    );

    return fallbackAccounts;
  };

  const setCurrentSession = (account) => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        login: account.login,
        role: account.role,
      }),
    );
  };

  const getCurrentSession = () => {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession);
    } catch (error) {
      console.error("Session storage is corrupted", error);
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  };

  const findAccount = (login, password) =>
    getAccountsDb().find(
      (account) => account.login === login && account.password === password,
    );

  window.setTimeout(() => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
  }, 2400);

  window.setTimeout(() => {
    if (intro) {
      intro.setAttribute("hidden", "");
    }
  }, 3200);

  const openAuthModal = () => {
    if (!authModal) {
      return;
    }

    authModal.removeAttribute("hidden");
    authModal.hidden = false;
    document.body.classList.add("modal-open");
    if (authFeedback) {
      authFeedback.textContent = "";
      authFeedback.className = "auth-feedback";
    }
    window.setTimeout(() => loginInput?.focus(), 50);
  };

  const openGameModeModal = () => {
    if (!gameModeModal) {
      return;
    }

    gameModeModal.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    if (gameModeFeedback) {
      gameModeFeedback.textContent = "";
      gameModeFeedback.className = "auth-feedback";
    }
  };

  const closeAuthModal = () => {
    if (!authModal) {
      return;
    }

    authModal.hidden = true;
    authModal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  };

  const closeGameModeModal = () => {
    if (!gameModeModal) {
      return;
    }

    gameModeModal.hidden = true;
    gameModeModal.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  };

  const enableAdminMode = () => {
    if (statusBanner) {
      statusBanner.removeAttribute("hidden");

      if (bannerTimeoutId) {
        window.clearTimeout(bannerTimeoutId);
      }

      bannerTimeoutId = window.setTimeout(() => {
        statusBanner.setAttribute("hidden", "");
      }, 3200);
    }

    debugTrigger?.removeAttribute("hidden");
    document.body.classList.add("is-admin");

    if (profileButton) {
      profileButton.setAttribute("aria-label", "Профиль администратора");
      profileButton.classList.add("is-active");
    }
  };

  const applySession = (session) => {
    if (!session) {
      return;
    }

    if (profileButton) {
      profileButton.classList.add("is-active");
      profileButton.setAttribute("aria-label", `Профиль ${session.login}`);
    }

    if (session.role === "admin") {
      enableAdminMode();
    }
  };

  const handleStartGame = () => {
    const currentSession = getCurrentSession();

    if (currentSession) {
      openGameModeModal();
      return;
    }

    pendingStartGame = true;
    openAuthModal();
  };

  startGameButton?.addEventListener("click", handleStartGame);
  heroStartButton?.addEventListener("click", handleStartGame);
  authClose?.addEventListener("click", closeAuthModal);
  authBackdrop?.addEventListener("click", closeAuthModal);
  gameModeClose?.addEventListener("click", closeGameModeModal);
  gameModeBackdrop?.addEventListener("click", closeGameModeModal);
  playBotsButton?.addEventListener("click", () => {
    window.location.href = "game.html";
  });
  searchGameButton?.addEventListener("click", () => {
    if (gameModeFeedback) {
      gameModeFeedback.textContent = "Поиск игры подключим следующим шагом. Пока доступен режим с ботами.";
      gameModeFeedback.className = "auth-feedback is-success";
    }
  });

  authForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const login = loginInput?.value.trim() ?? "";
    const password = passwordInput?.value.trim() ?? "";

    const matchedAccount = findAccount(login, password);

    if (matchedAccount) {
      if (authFeedback) {
        authFeedback.textContent = "Вход выполнен. Данные аккаунта сохранены на этом устройстве.";
        authFeedback.className = "auth-feedback is-success";
      }

      setCurrentSession(matchedAccount);
      applySession(matchedAccount);

      window.setTimeout(() => {
        closeAuthModal();
        authForm.reset();
        if (pendingStartGame) {
          openGameModeModal();
          pendingStartGame = false;
        }
      }, 450);

      return;
    }

    if (authFeedback) {
      authFeedback.textContent = "Неверный логин или пароль. Попробуйте снова.";
      authFeedback.className = "auth-feedback is-error";
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && authModal && !authModal.hidden) {
      closeAuthModal();
    }

    if (event.key === "Escape" && gameModeModal && !gameModeModal.hidden) {
      closeGameModeModal();
    }
  });

  getAccountsDb();

  const savedSession = getCurrentSession();
  applySession(savedSession);

  window.setTimeout(() => {
    if (!hasAutoOpenedAuth && !savedSession) {
      openAuthModal();
      hasAutoOpenedAuth = true;
    }
  }, 3250);
});
