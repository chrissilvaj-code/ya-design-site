(() => {
  const serviceCards = [...document.querySelectorAll(".quote-service")];
  const summaryItems = document.querySelector("#quote-summary-items");
  const totalsBox = document.querySelector(".quote-summary__totals");
  const subtotalElement = document.querySelector("#quote-subtotal");
  const discountElement = document.querySelector("#quote-discount");
  const discountRow = document.querySelector("#quote-discount-row");
  const grandTotalElement = document.querySelector("#quote-grand-total");
  const totalElement = document.querySelector("#quote-total");
  const totalLabel = document.querySelector("#quote-total-label");
  const recommendationElement = document.querySelector("#quote-recommendation");
  const form = document.querySelector("#quote-client-form");
  const feedback = document.querySelector("#quote-feedback");
  const shareButton = document.querySelector("#quote-share-pdf");
  const downloadButton = document.querySelector("#quote-download-pdf");
  const whatsappButton = document.querySelector("#quote-whatsapp");

  if (!serviceCards.length || !form) return;

  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const number = new Intl.NumberFormat("pt-BR");
  const minimumOrder = 300;
  let currentQuote = { items: [], subtotal: 0, discount: 0, total: 0 };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const volumeRate = (quantity) => {
    if (quantity >= 20) return 0.15;
    if (quantity >= 10) return 0.1;
    if (quantity >= 5) return 0.05;
    return 0;
  };

  const getQuote = () => {
    const items = serviceCards
      .map((card) => {
        const input = card.querySelector("input");
        const quantity = clamp(Number.parseInt(input.value, 10) || 0, Number(input.min) || 0, Number(input.max) || 99);
        input.value = quantity;
        card.classList.toggle("is-selected", quantity > 0);

        if (!quantity) return null;

        const unitPrice = Number(card.dataset.price);
        const gross = unitPrice * quantity;
        const rate = card.dataset.volume === "true" ? volumeRate(quantity) : 0;
        const discount = gross * rate;

        return {
          id: card.dataset.service,
          name: card.dataset.name,
          quantity,
          unitPrice,
          gross,
          rate,
          discount,
          total: gross - discount,
          starting: card.dataset.starting === "true",
          strategic: card.dataset.strategic === "true"
        };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.gross, 0);
    const discount = items.reduce((sum, item) => sum + item.discount, 0);

    return { items, subtotal, discount, total: subtotal - discount };
  };

  const getRecommendation = (quote) => {
    if (quote.items.some((item) => item.id === "operation")) {
      return { title: "Corporate & Enterprise pode ser mais adequado", text: "A operação comercial completa exige diagnóstico de volume, canais e processo de qualificação." };
    }

    if (quote.items.some((item) => ["funnel", "site", "mascot"].includes(item.id))) {
      return { title: "Uma estrutura Authority pode gerar mais integração", text: "Seu projeto reúne entregas estratégicas que podem se beneficiar de uma direção única de marca, tecnologia e conversão." };
    }

    if (quote.total >= 3500) {
      return { title: "Compare com a Estrutura Scale", text: "Pelo volume selecionado, o plano completo pode oferecer melhor custo-benefício, direção e consistência entre as entregas." };
    }

    if (quote.total >= 2000) {
      return { title: "Compare com a Estrutura Base", text: "Seu volume já se aproxima de um projeto estruturado. A YA Design pode avaliar qual formato oferece mais valor." };
    }

    return null;
  };

  const renderQuote = () => {
    currentQuote = getQuote();
    const hasItems = currentQuote.items.length > 0;

    totalElement.textContent = currency.format(currentQuote.total);
    subtotalElement.textContent = currency.format(currentQuote.subtotal);
    discountElement.textContent = `− ${currency.format(currentQuote.discount)}`;
    grandTotalElement.textContent = currency.format(currentQuote.total);
    totalsBox.hidden = !hasItems;
    discountRow.hidden = currentQuote.discount <= 0;

    if (!hasItems) {
      summaryItems.innerHTML = '<p class="quote-summary__empty">Seu resumo aparecerá aqui.</p>';
      totalLabel.textContent = "Selecione pelo menos um serviço";
      recommendationElement.hidden = true;
      return;
    }

    summaryItems.innerHTML = currentQuote.items
      .map((item) => {
        const discountText = item.rate ? ` · ${Math.round(item.rate * 100)}% de desconto` : "";
        const startingText = item.starting ? "A partir de " : "";
        return `<div class="quote-summary__item"><span>${item.name}<small>${number.format(item.quantity)} × ${currency.format(item.unitPrice)}${discountText}</small></span><strong>${startingText}${currency.format(item.total)}</strong></div>`;
      })
      .join("");

    totalLabel.textContent = currentQuote.total < minimumOrder
      ? `Pedido mínimo: ${currency.format(minimumOrder)}`
      : currentQuote.items.some((item) => item.starting)
        ? "Valor inicial sujeito a diagnóstico"
        : "Estimativa calculada automaticamente";

    const recommendation = getRecommendation(currentQuote);
    if (recommendation) {
      recommendationElement.innerHTML = `<strong>${recommendation.title}</strong>${recommendation.text}`;
      recommendationElement.hidden = false;
    } else {
      recommendationElement.hidden = true;
    }
  };

  serviceCards.forEach((card) => {
    const input = card.querySelector("input");
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 99;

    card.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quantity-action]");
      if (!button) return;
      const direction = button.dataset.quantityAction === "increase" ? 1 : -1;
      input.value = clamp((Number.parseInt(input.value, 10) || 0) + direction, min, max);
      renderQuote();
    });

    input.addEventListener("input", renderQuote);
    input.addEventListener("blur", renderQuote);
  });

  const setFeedback = (message, isError = false) => {
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
  };

  const getClient = () => Object.fromEntries(new FormData(form).entries());

  const validate = () => {
    renderQuote();
    const client = getClient();

    if (!currentQuote.items.length) {
      setFeedback("Selecione pelo menos um serviço para continuar.", true);
      document.querySelector("#monte-seu-orcamento").scrollIntoView({ behavior: "smooth", block: "start" });
      return null;
    }

    if (currentQuote.total < minimumOrder) {
      setFeedback(`O pedido mínimo é ${currency.format(minimumOrder)}. Adicione outro serviço ou mais unidades.`, true);
      return null;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback("Preencha pelo menos seu nome e WhatsApp.", true);
      return null;
    }

    setFeedback("");
    return client;
  };

  const quoteCode = () => {
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
    return `YA-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  const addWrappedText = (doc, text, x, y, width, options = {}) => {
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x, y, options);
    return y + lines.length * 5;
  };

  const createPdfBrandAssets = async () => {
    await document.fonts.load("700 54px Ubuntu");

    const logo = new Image();
    logo.src = "../Ya-Design/logo-ya-green.png";
    await logo.decode();

    const wordmarkCanvas = document.createElement("canvas");
    wordmarkCanvas.width = 520;
    wordmarkCanvas.height = 100;
    const wordmarkContext = wordmarkCanvas.getContext("2d");
    wordmarkContext.clearRect(0, 0, wordmarkCanvas.width, wordmarkCanvas.height);
    wordmarkContext.fillStyle = "#ccff00";
    wordmarkContext.font = "700 58px Ubuntu, sans-serif";
    wordmarkContext.textBaseline = "middle";
    wordmarkContext.fillText("YA DESIGN", 0, 52);

    const watermarkCanvas = document.createElement("canvas");
    watermarkCanvas.width = 512;
    watermarkCanvas.height = 512;
    const watermarkContext = watermarkCanvas.getContext("2d");
    watermarkContext.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
    watermarkContext.globalAlpha = 0.09;
    watermarkContext.drawImage(logo, 0, 0, 512, 512);

    return {
      wordmark: wordmarkCanvas.toDataURL("image/png"),
      watermark: watermarkCanvas.toDataURL("image/png"),
    };
  };

  const buildPdf = async (client) => {
    if (!window.jspdf?.jsPDF) throw new Error("A biblioteca de PDF não foi carregada.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const code = quoteCode();
    const today = new Intl.DateTimeFormat("pt-BR").format(new Date());
    const hasStartingPrice = currentQuote.items.some((item) => item.starting);
    const brandAssets = await createPdfBrandAssets();

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");
    doc.addImage(brandAssets.watermark, "PNG", 50, 104, 110, 110, undefined, "FAST");
    doc.setFillColor(204, 255, 0);
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(24, 28, 23);
    doc.roundedRect(14, 14, 182, 47, 4, 4, "F");

    doc.addImage(brandAssets.wordmark, "PNG", 23, 23, 51, 9.8, undefined, "FAST");
    doc.setTextColor(204, 255, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ESTIMATIVA PERSONALIZADA", 23, 45);

    doc.setTextColor(220, 224, 215);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Referência: ${code}`, 184, 32, { align: "right" });
    doc.text(`Emissão: ${today}`, 184, 39, { align: "right" });
    doc.text("Validade: 7 dias", 184, 46, { align: "right" });

    doc.setFillColor(244, 246, 241);
    doc.roundedRect(18, 68, 174, 22, 3, 3, "F");
    doc.setTextColor(24, 28, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(client.name, 24, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(91, 98, 88);
    const details = [client.company, client.phone, client.email].filter(Boolean).join("  ·  ");
    doc.text(details || "Solicitante", 24, 85);

    let y = 101;
    doc.setFillColor(24, 28, 23);
    doc.roundedRect(18, y - 7, 174, 11, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("SERVIÇO", 23, y);
    doc.text("QTD.", 139, y, { align: "right" });
    doc.text("TOTAL", 190, y, { align: "right" });
    y += 10;

    currentQuote.items.forEach((item) => {
      doc.setTextColor(24, 28, 23);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const title = item.starting ? `${item.name} (a partir de)` : item.name;
      const titleLines = doc.splitTextToSize(title, 105);
      doc.text(titleLines, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(item.quantity), 139, y, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(currency.format(item.total), 190, y, { align: "right" });

      if (item.rate) {
      doc.setTextColor(66, 84, 7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`${Math.round(item.rate * 100)}% de desconto por volume`, 20, y + 5);
      }

      y += Math.max(13, titleLines.length * 5 + (item.rate ? 5 : 0));
      doc.setDrawColor(218, 223, 214);
      doc.line(20, y - 5, 190, y - 5);
    });

    y = Math.max(y + 2, 180);
    doc.setFillColor(239, 242, 235);
    doc.roundedRect(105, y, 85, currentQuote.discount ? 36 : 29, 3, 3, "F");
    doc.setTextColor(82, 89, 79);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Subtotal", 113, y + 9);
    doc.text(currency.format(currentQuote.subtotal), 183, y + 9, { align: "right" });

    let totalY = y + 17;
    if (currentQuote.discount) {
      doc.text("Desconto por volume", 113, totalY);
      doc.setTextColor(61, 78, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`- ${currency.format(currentQuote.discount)}`, 183, totalY, { align: "right" });
      totalY += 9;
    }

    doc.setTextColor(24, 28, 23);
    doc.setFont("helvetica", "bold");
    doc.text(hasStartingPrice ? "Estimativa inicial" : "Estimativa total", 113, totalY);
    doc.setTextColor(61, 78, 0);
    doc.setFontSize(16);
    doc.text(currency.format(currentQuote.total), 183, totalY, { align: "right" });

    let footerY = Math.max(y + 48, 235);
    if (client.notes) {
      doc.setTextColor(61, 78, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("OBSERVAÇÕES DO SOLICITANTE", 20, footerY);
      doc.setTextColor(54, 60, 52);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      footerY = addWrappedText(doc, client.notes, 20, footerY + 7, 170);
    }

    doc.setTextColor(91, 98, 88);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    addWrappedText(doc, "Esta estimativa está sujeita à validação do briefing, complexidade, prazo e disponibilidade. A contratação e o valor final somente serão confirmados após aprovação da YA Design.", 20, Math.min(Math.max(footerY + 10, 262), 275), 170);
    doc.setDrawColor(218, 223, 214);
    doc.line(20, 282, 190, 282);
    doc.setTextColor(61, 78, 0);
    doc.setFont("helvetica", "bold");
    doc.text("yasmindesigner.com  ·  WhatsApp: (18) 99804-5806", 20, 288);

    const safeName = client.name.trim().replace(/[^a-zA-Z0-9À-ÿ]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    const fileName = `estimativa-ya-design-${safeName || "projeto"}.pdf`;
    const blob = doc.output("blob");
    return { blob, fileName, code };
  };

  const buildMessage = (client, code = "") => {
    const lines = [
      `Olá, Yasmin! Meu nome é ${client.name}${client.company ? `, da ${client.company}` : ""}.`,
      "Montei esta estimativa pelo site da YA Design:",
      ""
    ];

    currentQuote.items.forEach((item) => {
      lines.push(`• ${item.quantity}× ${item.name}: ${item.starting ? "a partir de " : ""}${currency.format(item.total)}`);
    });

    lines.push("", `Estimativa total: ${currentQuote.items.some((item) => item.starting) ? "a partir de " : ""}${currency.format(currentQuote.total)}`);
    if (code) lines.push(`Referência: ${code}`);
    if (client.notes) lines.push("", `Observações: ${client.notes}`);
    lines.push("", "Gostaria de validar o escopo, o prazo e o valor final.");
    return lines.join("\n");
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  downloadButton.addEventListener("click", async () => {
    const client = validate();
    if (!client) return;

    try {
      setFeedback("Gerando seu PDF…");
      const pdf = await buildPdf(client);
      downloadBlob(pdf.blob, pdf.fileName);
      setFeedback("PDF gerado com sucesso.");
    } catch (error) {
      console.error(error);
      setFeedback("Não foi possível gerar o PDF. Tente novamente.", true);
    }
  });

  shareButton.addEventListener("click", async () => {
    const client = validate();
    if (!client) return;

    try {
      setFeedback("Preparando o documento para compartilhar…");
      const pdf = await buildPdf(client);
      const file = new File([pdf.blob], pdf.fileName, { type: "application/pdf" });
      const shareData = { title: "Estimativa YA Design", text: buildMessage(client, pdf.code), files: [file] };

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        setFeedback("Documento compartilhado.");
      } else {
        downloadBlob(pdf.blob, pdf.fileName);
        setFeedback("Seu navegador não compartilha arquivos diretamente. O PDF foi baixado para você anexar no WhatsApp.");
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        setFeedback("Compartilhamento cancelado.");
        return;
      }
      console.error(error);
      setFeedback("Não foi possível compartilhar. Use o botão Baixar PDF.", true);
    }
  });

  whatsappButton.addEventListener("click", () => {
    const client = validate();
    if (!client) return;
    const url = `https://wa.me/5518998045806?text=${encodeURIComponent(buildMessage(client))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  const phoneInput = form.elements.phone;
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) phoneInput.value = digits;
    else if (digits.length <= 6) phoneInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    else if (digits.length <= 10) phoneInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    else phoneInput.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  });

  renderQuote();
})();
