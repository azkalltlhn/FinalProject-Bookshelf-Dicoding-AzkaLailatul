document.addEventListener("DOMContentLoaded", function () {
  let books = [];
  const RENDER_EVENT = "render-book";
  const STORAGE_KEY = "BOOKSHELF_APPS";
  let selectedBookId = null;

  function generateId() {
    return +new Date();
  }

  function findBookIndex(bookId) {
    return books.findIndex((book) => book.id === bookId);
  }

  function findBook(bookId) {
    return books.find((book) => book.id === bookId);
  }

  function saveData() {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  }

  function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      books = JSON.parse(data);
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }

  function renderBookElement(book) {
    const bookElement = document.createElement("div");
    bookElement.setAttribute("data-bookid", book.id);
    bookElement.setAttribute("data-testid", "bookItem");

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;

    // toggle status selesai/belum
    bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]')
      .addEventListener("click", function () {
        openModal(book.id, book.isComplete);
      });

    // hapus buku
    bookElement.querySelector('[data-testid="bookItemDeleteButton"]')
      .addEventListener("click", function () {
        selectedBookId = book.id;
        document.getElementById("deleteModal").style.display = "flex";
      });

    // edit buku
    bookElement.querySelector('[data-testid="bookItemEditButton"]')
      .addEventListener("click", function () {
        selectedBookId = book.id;
        document.getElementById("editTitle").value = book.title;
        document.getElementById("editAuthor").value = book.author;
        document.getElementById("editYear").value = book.year;
        document.getElementById("editModal").style.display = "flex";
      });

    return bookElement;
  }

  document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    for (const book of books) {
      const bookElement = renderBookElement(book);
      if (book.isComplete) completeBookList.appendChild(bookElement);
      else incompleteBookList.appendChild(bookElement);
    }
  });

  // tambah buku baru
  document.getElementById("bookForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("bookFormTitle").value.trim();
    const author = document.getElementById("bookFormAuthor").value.trim();
    const year = parseInt(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      alert(`Tahun harus antara 1900 dan ${currentYear}`);
      return;
    }

    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      isComplete,
    };

    books.push(newBook);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    this.reset();
  });

  // cari buku (judul, penulis, tahun)
  document.getElementById("searchBook").addEventListener("submit", function (event) {
    event.preventDefault();
    const query = document.getElementById("searchBookTitle").value.trim().toLowerCase();

    let filtered = [];
    if (query === "") {
      filtered = books;
    } else {
      filtered = books.filter((book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        String(book.year).includes(query)
      );
    }

    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    if (filtered.length === 0) {
      const notFound = document.createElement("p");
      notFound.textContent = "Buku tidak ditemukan.";
      notFound.style.fontStyle = "italic";
      notFound.style.color = "#6b7280";
      incompleteBookList.appendChild(notFound);
      completeBookList.appendChild(notFound.cloneNode(true));
    } else {
      for (const book of filtered) {
        const bookElement = renderBookElement(book);
        if (book.isComplete) completeBookList.appendChild(bookElement);
        else incompleteBookList.appendChild(bookElement);
      }
    }
  });

  // simpan edit buku
  document.getElementById("editBookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (selectedBookId !== null) {
      const index = findBookIndex(selectedBookId);
      if (index !== -1) {
        const editTitle = document.getElementById("editTitle").value.trim();
        const editAuthor = document.getElementById("editAuthor").value.trim();
        const editYear = parseInt(document.getElementById("editYear").value);

        const currentYear = new Date().getFullYear();
        if (isNaN(editYear) || editYear < 1900 || editYear > currentYear) {
          alert(`Tahun harus antara 1900 dan ${currentYear}`);
          return;
        }

        books[index].title = editTitle;
        books[index].author = editAuthor;
        books[index].year = editYear;

        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
        closeEditModal();
      }
    }
  });

  document.getElementById("cancelEdit").addEventListener("click", closeEditModal);
  function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    selectedBookId = null;
    document.getElementById("editBookForm").reset();
  }

  // modal toggle selesai dibaca
  function openModal(bookId, isComplete) {
    selectedBookId = bookId;
    document.getElementById("modalMessage").textContent =
      isComplete
        ? "Pindahkan ke Belum selesai dibaca?"
        : "Pindahkan ke Selesai dibaca?";
    document.getElementById("confirmModal").style.display = "flex";
  }

  document.getElementById("yesBtn").addEventListener("click", function () {
    if (selectedBookId !== null) {
      const index = findBookIndex(selectedBookId);
      if (index !== -1) {
        books[index].isComplete = !books[index].isComplete;
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
      }
    }
    closeModal();
  });

  document.getElementById("noBtn").addEventListener("click", function () {
    closeModal();
  });

  function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
    selectedBookId = null;
  }

  // modal hapus
  document.getElementById("deleteYes").addEventListener("click", function () {
    if (selectedBookId !== null) {
      const index = findBookIndex(selectedBookId);
      if (index !== -1) {
        books.splice(index, 1);
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
      }
    }
    closeDeleteModal();
  });

  document.getElementById("deleteNo").addEventListener("click", function () {
    closeDeleteModal();
  });

  function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    selectedBookId = null;
  }

  // load awal
  loadData();
});
