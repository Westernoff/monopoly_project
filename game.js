window.addEventListener("load", () => {
  const gameIntro = document.getElementById("gameIntro");
  const gameLoadingSubtitle = document.getElementById("gameLoadingSubtitle");
  const gameGrid = document.getElementById("gameGrid");
  const gamePlayerList = document.getElementById("gamePlayerList");
  const gameLog = document.getElementById("gameLog");
  const turnStatus = document.getElementById("turnStatus");
  const cellTitle = document.getElementById("cellTitle");
  const cellDescription = document.getElementById("cellDescription");
  const dieOne = document.getElementById("dieOne");
  const dieTwo = document.getElementById("dieTwo");
  const rollDiceButton = document.getElementById("rollDiceButton");
  const buyPropertyButton = document.getElementById("buyPropertyButton");
  const endTurnButton = document.getElementById("endTurnButton");
  const gameExitButton = document.getElementById("gameExitButton");
  const exitConfirmModal = document.getElementById("exitConfirmModal");
  const exitConfirmBackdrop = document.getElementById("exitConfirmBackdrop");
  const exitConfirmClose = document.getElementById("exitConfirmClose");
  const exitCancelButton = document.getElementById("exitCancelButton");

  const loadingPhrases = [
    "Раскидываем кубики...",
    "Убираем поле после прошлой драмы...",
    "Раздаем ботам слишком много уверенности...",
    "Проверяем, не спрятал ли кто-то банк...",
    "Готовим первый ход и легкую панику...",
  ];

  const board = [
    { id: 0, name: "Старт", type: "start", description: "Пересечение старта приносит 200." },
    { id: 1, name: "Old Kent Road", type: "property", cost: 60, rent: 20, color: "brown", description: "Недорогое предприятие для первого капитала." },
    { id: 2, name: "Шанс", type: "chance", description: "Случайное событие меняет ход партии." },
    { id: 3, name: "Whitechapel Works", type: "property", cost: 80, rent: 24, color: "brown", description: "Скромная мастерская с быстрой окупаемостью." },
    { id: 4, name: "Тюрьма", type: "jail", description: "Просто визит, если вы не арестованы." },
    { id: 5, name: "The Angel", type: "property", cost: 100, rent: 30, color: "light-blue", description: "Популярная улица с ровной доходностью." },
    { id: 6, name: "Водоканал", type: "utility", cost: 150, rent: 45, color: "utility", description: "Классическая коммунальная клетка." },
    { id: 7, name: "Euston Road", type: "property", cost: 120, rent: 36, color: "light-blue", description: "Стабильная точка для аренды." },
    { id: 8, name: "В тюрьму", type: "go-to-jail", description: "Мгновенный билет на скамейку запасных." },
    { id: 9, name: "Vine Street", type: "property", cost: 160, rent: 48, color: "pink", description: "Улица, которая быстро бьет по кошельку." },
    { id: 10, name: "Налог", type: "tax", amount: 100, description: "Налоговая забирает часть дохода." },
    { id: 11, name: "Marlborough", type: "property", cost: 180, rent: 54, color: "pink", description: "Дорогая клетка с хорошей арендой." },
    { id: 12, name: "Бесплатная парковка", type: "free-parking", description: "Редкий островок тишины." },
    { id: 13, name: "King's Cross", type: "railroad", cost: 200, rent: 60, color: "rail", description: "Транспортный узел с уверенной арендой." },
    { id: 14, name: "Шанс", type: "chance", description: "Еще одна возможность встряхнуть партию." },
    { id: 15, name: "Regent Street", type: "property", cost: 220, rent: 66, color: "orange", description: "Солидный актив под финальную фазу матча." },
  ];

  const placements = [
    "bottom-left",
    "bottom-2",
    "bottom-3",
    "bottom-4",
    "bottom-right",
    "right-4",
    "right-3",
    "right-2",
    "top-right",
    "top-4",
    "top-3",
    "top-2",
    "top-left",
    "left-2",
    "left-3",
    "left-4",
  ];

  const state = {
    players: [
      { id: "human", name: "Вы", money: 1500, position: 0, isBot: false, bankrupt: false, skipTurns: 0, color: "human" },
      { id: "bot-1", name: "Bot 01", money: 1500, position: 0, isBot: true, bankrupt: false, skipTurns: 0, color: "bot-1" },
      { id: "bot-2", name: "Bot 02", money: 1500, position: 0, isBot: true, bankrupt: false, skipTurns: 0, color: "bot-2" },
      { id: "bot-3", name: "Bot 03", money: 1500, position: 0, isBot: true, bankrupt: false, skipTurns: 0, color: "bot-3" },
    ],
    ownership: {},
    currentPlayerIndex: 0,
    pendingPurchase: null,
    phase: "roll",
    dice: [0, 0],
    extraTurn: false,
    log: [],
    gameOver: false,
    botTimeoutId: null,
  };

  const addLog = (message) => {
    state.log.unshift(message);
    state.log = state.log.slice(0, 12);
  };

  const getPlayerById = (id) => state.players.find((player) => player.id === id);
  const getCurrentPlayer = () => state.players[state.currentPlayerIndex];
  const getActivePlayers = () => state.players.filter((player) => !player.bankrupt);

  const updateDice = () => {
    dieOne.textContent = state.dice[0] || "-";
    dieTwo.textContent = state.dice[1] || "-";
  };

  const formatMoney = (amount) => `$${amount}`;

  const getCellOwner = (cellId) => {
    const ownerId = state.ownership[cellId];
    return ownerId ? getPlayerById(ownerId) : null;
  };

  const getPropertyDescription = (cell) => {
    if (cell.type === "property" || cell.type === "railroad" || cell.type === "utility") {
      const owner = getCellOwner(cell.id);
      return owner
        ? `${cell.description} Владелец: ${owner.name}. Аренда: ${formatMoney(cell.rent)}.`
        : `${cell.description} Стоимость: ${formatMoney(cell.cost)}. Аренда: ${formatMoney(cell.rent)}.`;
    }

    if (cell.type === "tax") {
      return `${cell.description} Сумма: ${formatMoney(cell.amount)}.`;
    }

    return cell.description;
  };

  const renderBoard = () => {
    if (!gameGrid) {
      return;
    }

    gameGrid.querySelectorAll(".game-board-cell").forEach((cellNode) => cellNode.remove());

    board.forEach((cell, index) => {
      const owner = getCellOwner(cell.id);
      const occupants = state.players.filter(
        (player) => !player.bankrupt && player.position === cell.id,
      );
      const cellNode = document.createElement("article");
      cellNode.className = `game-board-cell ${placements[index]} cell-${cell.type}`;
      cellNode.dataset.cellId = String(cell.id);

      const tokensMarkup = occupants
        .map(
          (player) =>
            `<span class="board-token ${player.color}" title="${player.name}"></span>`,
        )
        .join("");

      cellNode.innerHTML = `
        <div class="board-cell-top">
          <span class="board-cell-name">${cell.name}</span>
          ${
            owner
              ? `<span class="board-owner">${owner.name}</span>`
              : cell.cost
                ? `<span class="board-cost">${formatMoney(cell.cost)}</span>`
                : ""
          }
        </div>
        <div class="board-cell-bottom">
          <span class="board-cell-type">${cell.type.replace(/-/g, " ")}</span>
          <div class="board-tokens">${tokensMarkup}</div>
        </div>
      `;

      gameGrid.appendChild(cellNode);
    });
  };

  const renderPlayers = () => {
    if (!gamePlayerList) {
      return;
    }

    gamePlayerList.innerHTML = state.players
      .map((player, index) => {
        const isCurrent = index === state.currentPlayerIndex && !state.gameOver;
        const ownedCount = Object.values(state.ownership).filter(
          (ownerId) => ownerId === player.id,
        ).length;

        return `
          <article class="game-player ${isCurrent ? "active" : ""} ${player.bankrupt ? "bankrupt" : ""}">
            <span class="game-player-dot ${player.color}"></span>
            <div>
              <strong>${player.name}</strong>
              <p>${formatMoney(player.money)} · Активов: ${ownedCount}</p>
              ${
                player.bankrupt
                  ? "<p>Выбыл из партии</p>"
                  : player.skipTurns > 0
                    ? `<p>Пропуск хода: ${player.skipTurns}</p>`
                    : ""
              }
            </div>
          </article>
        `;
      })
      .join("");
  };

  const renderLog = () => {
    if (!gameLog) {
      return;
    }

    gameLog.innerHTML = state.log
      .map((entry) => `<p class="game-log-entry">${entry}</p>`)
      .join("");
  };

  const renderCellInfo = (cell) => {
    cellTitle.textContent = cell.name;
    cellDescription.textContent = getPropertyDescription(cell);
  };

  const updateControls = () => {
    const currentPlayer = getCurrentPlayer();
    const isHumanTurn = currentPlayer && !currentPlayer.isBot && !currentPlayer.bankrupt;
    rollDiceButton.hidden = !isHumanTurn || state.phase !== "roll" || state.gameOver;
    buyPropertyButton.hidden = !state.pendingPurchase || !isHumanTurn || state.gameOver;
    endTurnButton.hidden =
      (state.phase !== "end" && state.phase !== "buy") || !isHumanTurn || state.gameOver;
    endTurnButton.textContent = state.phase === "buy" ? "Пропустить покупку" : "Завершить ход";
  };

  const render = () => {
    renderBoard();
    renderPlayers();
    renderLog();
    updateDice();
    updateControls();
  };

  const checkBankruptcy = (player) => {
    if (player.money >= 0 || player.bankrupt) {
      return;
    }

    player.bankrupt = true;
    player.money = 0;

    Object.keys(state.ownership).forEach((cellId) => {
      if (state.ownership[cellId] === player.id) {
        delete state.ownership[cellId];
      }
    });

    addLog(`${player.name} выбывает из игры. Его активы возвращаются банку.`);
  };

  const resolveVictory = () => {
    const activePlayers = getActivePlayers();

    if (activePlayers.length === 1) {
      state.gameOver = true;
      state.phase = "gameover";
      turnStatus.textContent = `${activePlayers[0].name} побеждает в партии.`;
      addLog(`${activePlayers[0].name} выигрывает матч.`);
      render();
      return true;
    }

    return false;
  };

  const movePlayer = (player, steps) => {
    const previousPosition = player.position;
    const nextPosition = (player.position + steps) % board.length;

    if (previousPosition + steps >= board.length) {
      player.money += 200;
      addLog(`${player.name} проходит через Старт и получает ${formatMoney(200)}.`);
    }

    player.position = nextPosition;
    return board[nextPosition];
  };

  const payMoney = (payer, receiver, amount) => {
    payer.money -= amount;
    if (receiver) {
      receiver.money += amount;
    }
    checkBankruptcy(payer);
  };

  const drawChance = (player) => {
    const cards = [
      () => {
        player.money += 120;
        addLog(`${player.name} вытягивает удачный шанс и получает ${formatMoney(120)}.`);
      },
      () => {
        player.money -= 80;
        addLog(`${player.name} платит неожиданный штраф ${formatMoney(80)}.`);
        checkBankruptcy(player);
      },
      () => {
        player.position = 0;
        player.money += 200;
        addLog(`${player.name} переносится на Старт и получает ${formatMoney(200)}.`);
      },
      () => {
        player.skipTurns = 1;
        addLog(`${player.name} теряет следующий ход из-за бюрократии.`);
      },
    ];

    const action = cards[Math.floor(Math.random() * cards.length)];
    action();
  };

  const handleHumanLand = (player, cell) => {
    renderCellInfo(cell);

    if (
      (cell.type === "property" || cell.type === "utility" || cell.type === "railroad") &&
      !getCellOwner(cell.id) &&
      player.money >= cell.cost
    ) {
      state.pendingPurchase = cell.id;
      state.phase = "buy";
      turnStatus.textContent = `${player.name}, вы можете купить ${cell.name} за ${formatMoney(cell.cost)}.`;
      render();
      return;
    }

    state.phase = "end";
    turnStatus.textContent = `${player.name}, ход завершен.`;
    render();
  };

  const handleBotPurchase = (player, cell) => {
    const shouldBuy = player.money - cell.cost >= 180 || Math.random() > 0.35;

    if (shouldBuy) {
      state.ownership[cell.id] = player.id;
      player.money -= cell.cost;
      addLog(`${player.name} покупает ${cell.name} за ${formatMoney(cell.cost)}.`);
      renderCellInfo(cell);
    } else {
      addLog(`${player.name} пропускает покупку ${cell.name}.`);
    }
  };

  const resolveLanding = (player, cell) => {
    if (cell.type === "start" || cell.type === "jail" || cell.type === "free-parking") {
      addLog(`${player.name} останавливается на клетке "${cell.name}".`);
    }

    if (cell.type === "property" || cell.type === "utility" || cell.type === "railroad") {
      const owner = getCellOwner(cell.id);

      if (!owner) {
        addLog(`${player.name} попадает на ${cell.name}. Клетка свободна.`);

        if (player.isBot) {
          handleBotPurchase(player, cell);
          state.phase = "end";
        } else {
          handleHumanLand(player, cell);
          return;
        }
      } else if (owner.id !== player.id) {
        payMoney(player, owner, cell.rent);
        addLog(
          `${player.name} платит ${formatMoney(cell.rent)} игроку ${owner.name} за ${cell.name}.`,
        );
      } else {
        addLog(`${player.name} приходит на собственную клетку ${cell.name}.`);
      }
    } else if (cell.type === "tax") {
      payMoney(player, null, cell.amount);
      addLog(`${player.name} платит налог ${formatMoney(cell.amount)}.`);
    } else if (cell.type === "chance") {
      drawChance(player);
    } else if (cell.type === "go-to-jail") {
      player.position = 4;
      player.skipTurns = 1;
      state.extraTurn = false;
      addLog(`${player.name} отправляется в тюрьму и пропускает следующий ход.`);
    }

    if (resolveVictory()) {
      return;
    }

    renderCellInfo(board[player.position]);

    if (!player.isBot) {
      state.phase = "end";
      turnStatus.textContent = `${player.name}, можно завершать ход.`;
    } else {
      state.phase = "end";
    }

    render();
  };

  const advanceTurn = () => {
    if (state.gameOver) {
      return;
    }

    state.pendingPurchase = null;
    state.phase = "roll";
    state.dice = [0, 0];

    if (state.extraTurn) {
      state.extraTurn = false;
      const samePlayer = getCurrentPlayer();
      turnStatus.textContent = `${samePlayer.name} получает дополнительный ход за дубль.`;
      renderCellInfo(board[samePlayer.position]);
      render();
      queueBotTurn();
      return;
    }

    do {
      state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    } while (getCurrentPlayer().bankrupt);

    const currentPlayer = getCurrentPlayer();

    if (currentPlayer.skipTurns > 0) {
      currentPlayer.skipTurns -= 1;
      addLog(`${currentPlayer.name} пропускает ход.`);
      turnStatus.textContent = `${currentPlayer.name} пропускает этот ход.`;
      renderCellInfo(board[currentPlayer.position]);
      render();
      window.setTimeout(advanceTurn, 1100);
      return;
    }

    turnStatus.textContent = currentPlayer.isBot
      ? `${currentPlayer.name} готовится бросить кубики.`
      : "Ваш ход. Бросьте кубики.";
    renderCellInfo(board[currentPlayer.position]);
    render();
    queueBotTurn();
  };

  const buyPendingProperty = () => {
    const currentPlayer = getCurrentPlayer();
    const cellId = state.pendingPurchase;

    if (cellId === null || cellId === undefined) {
      return;
    }

    const cell = board.find((boardCell) => boardCell.id === cellId);

    if (!cell || currentPlayer.money < cell.cost) {
      state.pendingPurchase = null;
      state.phase = "end";
      render();
      return;
    }

    currentPlayer.money -= cell.cost;
    state.ownership[cell.id] = currentPlayer.id;
    state.pendingPurchase = null;
    state.phase = "end";
    addLog(`${currentPlayer.name} покупает ${cell.name} за ${formatMoney(cell.cost)}.`);
    turnStatus.textContent = `${cell.name} теперь принадлежит вам.`;
    renderCellInfo(cell);
    render();
  };

  const executeTurn = (player) => {
    if (player.bankrupt || state.gameOver) {
      return;
    }

    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    const total = dice[0] + dice[1];
    state.dice = dice;
    state.extraTurn = dice[0] === dice[1];
    addLog(`${player.name} бросает ${dice[0]} и ${dice[1]} (${total}).`);

    if (state.extraTurn) {
      addLog(`${player.name} выбрасывает дубль и может получить дополнительный ход.`);
    }

    const landedCell = movePlayer(player, total);
    turnStatus.textContent = `${player.name} перемещается на ${landedCell.name}.`;
    resolveLanding(player, landedCell);
  };

  const queueBotTurn = () => {
    const currentPlayer = getCurrentPlayer();

    if (!currentPlayer || !currentPlayer.isBot || state.phase !== "roll" || state.gameOver) {
      return;
    }

    if (state.botTimeoutId) {
      window.clearTimeout(state.botTimeoutId);
    }

    state.botTimeoutId = window.setTimeout(() => {
      executeTurn(currentPlayer);

      if (state.phase === "end" && !state.gameOver) {
        window.setTimeout(advanceTurn, 1000);
      }
    }, 1200);
  };

  rollDiceButton?.addEventListener("click", () => {
    const currentPlayer = getCurrentPlayer();

    if (!currentPlayer || currentPlayer.isBot || state.phase !== "roll" || state.gameOver) {
      return;
    }

    executeTurn(currentPlayer);
  });

  buyPropertyButton?.addEventListener("click", buyPendingProperty);

  endTurnButton?.addEventListener("click", () => {
    if ((state.phase !== "end" && state.phase !== "buy") || state.gameOver) {
      return;
    }

    if (state.phase === "buy") {
      const currentPlayer = getCurrentPlayer();
      const skippedCell = board.find((cell) => cell.id === state.pendingPurchase);
      if (skippedCell) {
        addLog(`${currentPlayer.name} отказывается от покупки ${skippedCell.name}.`);
      }
      state.pendingPurchase = null;
      state.phase = "end";
      turnStatus.textContent = "Покупка пропущена. Можно завершать ход.";
      render();
      return;
    }

    advanceTurn();
  });

  const openExitModal = () => {
    exitConfirmModal?.removeAttribute("hidden");
    document.body.classList.add("modal-open");
  };

  const closeExitModal = () => {
    exitConfirmModal?.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
  };

  gameExitButton?.addEventListener("click", openExitModal);
  exitConfirmBackdrop?.addEventListener("click", closeExitModal);
  exitConfirmClose?.addEventListener("click", closeExitModal);
  exitCancelButton?.addEventListener("click", closeExitModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && exitConfirmModal && !exitConfirmModal.hidden) {
      closeExitModal();
    }
  });

  let phraseIndex = 0;
  const phraseInterval = window.setInterval(() => {
    if (!gameLoadingSubtitle) {
      return;
    }

    phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
    gameLoadingSubtitle.textContent = loadingPhrases[phraseIndex];
  }, 1100);

  window.setTimeout(() => {
    document.body.classList.remove("game-loading");
    document.body.classList.add("game-ready");
  }, 3600);

  window.setTimeout(() => {
    window.clearInterval(phraseInterval);
    gameIntro?.setAttribute("hidden", "");
  }, 4300);

  addLog("Матч с ботами подготовлен.");
  addLog("В банке лежит начальный капитал, а боты уже строят хитрые планы.");
  renderCellInfo(board[0]);
  render();
});
