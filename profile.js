window.addEventListener("load", () => {
  const SESSION_STORAGE_KEY = "monopoly-project.session";
  const PROFILES_STORAGE_KEY = "monopoly-project.profiles";
  const profileForm = document.getElementById("profileForm");
  const profileNickname = document.getElementById("profileNickname");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileFeedback = document.getElementById("profileFeedback");
  const profileDisplayName = document.getElementById("profileDisplayName");
  const profileLoginLabel = document.getElementById("profileLoginLabel");
  const profileAvatarPreview = document.getElementById("profileAvatarPreview");
  const profileAvatarInitial = document.getElementById("profileAvatarInitial");
  const resetAvatarButton = document.getElementById("resetAvatarButton");

  const getCurrentSession = () => {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession);
    } catch (error) {
      console.error("Session storage is corrupted", error);
      return null;
    }
  };

  const getProfiles = () => {
    const rawProfiles = window.localStorage.getItem(PROFILES_STORAGE_KEY);

    if (!rawProfiles) {
      return {};
    }

    try {
      const parsedProfiles = JSON.parse(rawProfiles);
      return parsedProfiles && typeof parsedProfiles === "object" ? parsedProfiles : {};
    } catch (error) {
      console.error("Profiles storage is corrupted", error);
      return {};
    }
  };

  const setProfiles = (profiles) => {
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  };

  const session = getCurrentSession();
  const profileKey = session?.login ?? "guest";
  const baseName = session?.login ?? "guest";

  const buildInitial = (nickname) => nickname.trim().charAt(0).toUpperCase() || "M";

  const renderProfile = (profile) => {
    const nickname = profile.nickname || baseName;
    const avatar = profile.avatar || "";

    if (profileDisplayName) {
      profileDisplayName.textContent = nickname;
    }

    if (profileLoginLabel) {
      profileLoginLabel.textContent = `@${baseName}`;
    }

    if (profileNickname) {
      profileNickname.value = nickname;
    }

    if (profileAvatarInitial) {
      profileAvatarInitial.textContent = buildInitial(nickname);
      profileAvatarInitial.hidden = Boolean(avatar);
    }

    if (profileAvatarPreview) {
      profileAvatarPreview.style.backgroundImage = avatar ? `url("${avatar}")` : "";
    }
  };

  const currentProfiles = getProfiles();
  const currentProfile = currentProfiles[profileKey] ?? {
    nickname: baseName,
    avatar: "",
  };

  renderProfile(currentProfile);

  const saveProfile = (nextProfile) => {
    const profiles = getProfiles();
    profiles[profileKey] = nextProfile;
    setProfiles(profiles);
    renderProfile(nextProfile);
  };

  profileForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const nickname = profileNickname?.value.trim() ?? "";

    if (!nickname) {
      if (profileFeedback) {
        profileFeedback.textContent = "Никнейм не должен быть пустым.";
        profileFeedback.className = "auth-feedback is-error";
      }
      return;
    }

    const profiles = getProfiles();
    const savedProfile = profiles[profileKey] ?? currentProfile;
    saveProfile({
      nickname,
      avatar: savedProfile.avatar || "",
    });

    if (profileFeedback) {
      profileFeedback.textContent = "Профиль обновлен.";
      profileFeedback.className = "auth-feedback is-success";
    }
  });

  profileAvatar?.addEventListener("change", (event) => {
    const [file] = event.target.files ?? [];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const profiles = getProfiles();
      const savedProfile = profiles[profileKey] ?? currentProfile;
      const nextProfile = {
        nickname: profileNickname?.value.trim() || savedProfile.nickname || baseName,
        avatar: typeof reader.result === "string" ? reader.result : "",
      };

      saveProfile(nextProfile);

      if (profileFeedback) {
        profileFeedback.textContent = "Аватарка обновлена.";
        profileFeedback.className = "auth-feedback is-success";
      }
    });
    reader.readAsDataURL(file);
  });

  resetAvatarButton?.addEventListener("click", () => {
    const profiles = getProfiles();
    const savedProfile = profiles[profileKey] ?? currentProfile;

    saveProfile({
      nickname: profileNickname?.value.trim() || savedProfile.nickname || baseName,
      avatar: "",
    });

    if (profileAvatar) {
      profileAvatar.value = "";
    }

    if (profileFeedback) {
      profileFeedback.textContent = "Аватарка удалена.";
      profileFeedback.className = "auth-feedback is-success";
    }
  });
});
