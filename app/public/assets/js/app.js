const { createApp } = Vue;

// variabile per la schermata di sign up e di login
const Home = {
  // funzione data che restituisce il form
  data() {
    return {
      showSignUp: true, // switch tra schermata di sign up e di login
      form: {
        name: "",
        surname: "",
        username: "",
        password: "",
      },
    };
  },

  methods: {
    // metodo per fare il reset della form
    resetForm() {
      this.form.name = "";
      this.form.surname = "";
      this.form.username = "";
      this.form.password = "";
    },
    // metodo per fare lo switch tra sign up e login
    toggleForm() {
      this.showSignUp = !this.showSignUp;
      this.resetForm();
    },
    // metodo per gestire il submit
    async handleSubmit() {
      // otteniamo l'URL in base se è per il sign up o per il login
      const url = this.showSignUp ? "/api/auth/signup" : "/api/auth/signin";
      try {
        // facciamo il POST della form all'URL selezionato
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        const data = await response.json();
        // se OK, facciamo lo switch alla visualizzazione del Budget
        if (response.ok) {
          alert(data.msg);
          this.$router.push("/budget");
        } else {
          alert(data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },

    /* // Nel caso sia necessario eliminare degli utenti:
    async deleteUser() {
      try {
        const response = await fetch("/api/users/username", {
          method: "DELETE",
        });
        const data = await response.json();
        if (response.ok) {
          alert(data.msg);
        } else {
          alert("Fallimento nell'eliminare l'utente");
          console.log("Fallimento nell'eliminare l'utente:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    }, */
    /* Copia-incollare questo nel template:
    <button @click="deleteUser">Delete</button> */
  },

  // template per sign up e login
  template: `
        <!-- classe per gestire il form per il sign up / login -->
        <div class="form-wrapper">
          <h2 v-if="showSignUp">Registration</h2>
          <h2 v-else>Login</h2>
          <!-- form per gestire l'iscrizione / il login degli utenti, che al submit chiama handleSubmit -->
          <form @submit.prevent="handleSubmit">
              <div class="input-box" v-if="showSignUp">
                  <input type="text" placeholder="Enter your name" v-model="form.name" required>
              </div>
              <div class="input-box" v-if="showSignUp">
                  <input type="text" placeholder="Enter your surname" v-model="form.surname" required>
              </div>
              <div class="input-box">
                  <input type="text" placeholder="Enter your username" v-model="form.username" required>
              </div>
              <div class="input-box">
                  <input type="password" placeholder="Enter your password" v-model="form.password" required>
              </div>
              <div class="input-box button">
                  <input type="submit" :value="showSignUp ? 'Register' : 'Login'">
              </div>
              <div class="text">
                  <h3>{{ showSignUp ? 'Already have an account?' : 'No account?' }} 
                      <a href="#" @click.prevent="toggleForm">{{ showSignUp ? 'Login' : 'Sign-Up' }}</a>
                  </h3>
              </div>
          </form>
        </div>
        <!-- classe per gestire la descrizione dell'app -->
        <div class="description-wrapper">
                <h2>Welcome to the Budget App</h2>
                <p>Manage your finances with your friends easily and efficiently. Track your expenses, share them, and keep the balance with your friends.</p>
        </div>
    `,
};

const Budget = {
  data() {
    return {
      // elenco delle spese e degli utenti
      expenses: [],
      users: [],
      // queries per ricerca
      searchQuery: "",
      userQuery: "",
      // nuova spesa e spesa da modificare, formate dalla data, dalla descrizione, dalla categoria, dal totale e dalle persone che l'hanno condivisa
      newExpense: {
        date: new Date().toLocaleDateString("en-US"),
        description: "",
        category: "",
        amount: "",
        sharedWith: [],
      },
      editedExpense: {
        date: new Date().toLocaleTimeString("en-US"),
        description: "",
        category: "",
        amount: "",
        sharedWith: [],
      },
      // serie di variabili per gestire i vari modal / dropdown
      selectedExpense: null,
      userInfo: null,
      showAddExpenseForm: false,
      showEditExpenseForm: false,
      showDropdown: false,
    };
  },

  methods: {
    // metodo per andare alla visualizzazione balance
    toBalance() {
      this.$router.push("/balance");
    },
    // metodo asincrono per ottenere tutte le spese
    async fetchExpenses() {
      try {
        const response = await fetch("/api/budget/");
        const data = await response.json();
        if (response.ok) {
          this.expenses = data;
          this.sortExpenses();
        } else {
          alert("Fallimento nel fetch delle spese");
          console.error("Fallimento nel fetch delle spese:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere gli utenti in base ad una query
    async fetchUsers(query) {
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (response.ok) {
          this.users = data;
          this.showDropdown = true;
        } else {
          alert("Fallimento nel fetch degli utenti");
          console.error("Fallimento nel fetch degli utenti:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere le spese di un determinato anno
    async fetchExpensesYear(year) {
      try {
        const response = await fetch(`/api/budget/${year}`);
        const data = await response.json();
        if (response.ok) {
          this.expenses = data;
          this.sortExpenses();
        } else {
          alert("Fallimento nel fetch delle spese");
          console.error("Fallimento nel fetch delle spese:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere le spese di un mese di un anno
    async fetchExpensesMonth(year, month) {
      try {
        const response = await fetch(`/api/budget/${year}/${month}`);
        const data = await response.json();
        if (response.ok) {
          this.expenses = data;
          this.sortExpenses();
        } else {
          alert("Fallimento nel fetch delle spese");
          console.error("Fallimento nel fetch delle spese:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere una determinata spesa
    async fetchExpenseId(expense) {
      try {
        const response = await fetch(
          `/api/budget/${expense.year}/${expense.month}/${expense._id}`
        );
        const data = await response.json();
        if (response.ok) {
          this.selectedExpense = data;
        } else {
          alert("Fallimento nel fetch delle spese");
          console.error("Fallimento nel fetch delle spese:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere le informazioni sull'utente loggato
    async fetchUserInfo() {
      try {
        const response = await fetch("/api/budget/whoami");
        const data = await response.json();
        if (response.ok) {
          this.userInfo = data;
        } else {
          alert("Fallimento nel fetch delle informazioni dell'utente");
          console.error(
            "Fallimento nel fetch delle informazioni dell'utente:",
            data.msg
          );
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo per fare il reset della spesa selezionata
    clearSelectedExpense() {
      this.selectedExpense = null;
    },
    // metodo per verificare che le quote equivalgano al totale
    validateShares(expense) {
      if (expense.sharedWith.length === 0) return true;

      // attraverso la funzione reduce processiamo ogni elemento dello sharedWith salvando il risultato in sum e aggiungendoci per ogni elemento la share
      const totalShare = expense.sharedWith.reduce(
        (sum, userShare) => sum + parseFloat(userShare.share),
        0 // sum inizializzato a 0
      );
      const totalShareFixed = totalShare.toFixed(2);
      return parseFloat(totalShareFixed) === parseFloat(expense.amount);
    },
    // metodo asincrono per aggiungere le spese
    async addExpense() {
      // se le quote non equivalgono al totale ritorna
      if (!this.validateShares(this.newExpense)) {
        alert("La somma delle quote non equivale al totale della spesa.");
        return;
      }
      try {
        // normalizziamo la data per ottenere il mese e l'anno
        this.newExpense.date = this.normalizeDate(this.newExpense.date);
        const year = parseInt(this.newExpense.date.substring(0, 4));
        const month = parseInt(this.newExpense.date.substring(5, 7));
        const response = await fetch(`/api/budget/${year}/${month}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.newExpense),
        });
        const data = await response.json();
        if (response.ok) {
          alert(data.msg);
          this.fetchExpenses();
          this.newExpense = {
            date: new Date().toLocaleDateString("en-US"),
            description: "",
            amount: "",
            category: "",
            sharedWith: [],
          };
          this.toggleAddExpenseForm();
        } else {
          alert("Fallimento nell'aggiungere la spesa");
          console.log("Fallimento nell'aggiungere la spesa:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo per copiare la spesa da modificare in editedExpense
    editExpense(expense) {
      this.editedExpense = { ...expense };
      this.showEditExpenseForm = !this.showEditExpenseForm;
    },
    // metodo asincrono per aggiornare una spesa
    async updateExpense() {
      // se le quote non equivalgono al totale ritorna
      if (!this.validateShares(this.editedExpense)) {
        alert("La somma delle quote non equivale al totale della spesa.");
        return;
      }
      try {
        // normalizziamo la data per ottenere il mese e l'anno
        this.editedExpense.date = this.normalizeDate(this.editedExpense.date);
        const year = parseInt(this.editedExpense.date.substring(0, 4));
        const month = parseInt(this.editedExpense.date.substring(5, 7));
        const response = await fetch(
          `/api/budget/${year}/${month}/${this.editedExpense._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.editedExpense),
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(data.msg);
          this.fetchExpenses();
          this.showEditExpenseForm = false;
          this.editedExpense = {
            date: new Date().toLocaleTimeString("en-US"),
            description: "",
            category: "",
            amount: "",
            sharedWith: [],
          };
        } else {
          alert("Fallimento nell'aggiornare la spesa");
          console.log("Fallimento nell'aggiornare la spesa:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per eliminare una spesa
    async deleteExpense(expense) {
      // confermiamo che l'utente voglia eliminarla
      if (!window.confirm("Are you sure you want to delete this expense?"))
        return;
      try {
        const response = await fetch(
          `/api/budget/${expense.year}/${expense.month}/${expense._id}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(data.msg);
          // usiamo filter per creare un nuovo array per includere tutte le spese eccetto quella con _id = expense._id
          this.expenses = this.expenses.filter(
            (exp) => exp._id !== expense._id
          );
          this.fetchExpenses();
        } else {
          alert("Fallimento nell'eliminare la spesa");
          console.log("Fallimento nell'eliminare la spesa:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per gestire il filtro per mese o per anno
    async handleDateClick(year, month = null) {
      if (month) {
        await this.fetchExpensesMonth(year, month);
      } else {
        await this.fetchExpensesYear(year);
      }
    },
    // metodo per ordinare le spese
    sortExpenses() {
      // usiamo la funzione sort che prende una funzione di comparazione per determinare l'ordine delle spese
      this.expenses.sort((a, b) => {
        // convertiamo la proprietà data dei due elementi in oggetti Date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // se dateA è più recente di dateB ritorna -1, che significa che viene prima nell'ordine
        if (dateA > dateB) return -1;
        // e viceversa
        if (dateA < dateB) return 1;
        // altrimenti non cambia l'ordine
        return 0;
      });
    },
    // metodo per attivare/disattivare la form per aggiungere una spesa
    toggleAddExpenseForm() {
      this.showAddExpenseForm = !this.showAddExpenseForm;
    },
    // metodo per formattare una quantità in formato EUR
    formatCurrency(amount) {
      return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    // metodo per formattare il mese e aggiungerci padding
    formatMonth(month) {
      return month.toString().padStart(2, "0");
    },
    // metodo per ottenere il giorno da una data
    getDay(date) {
      const parsedDate = new Date(date);
      return this.formatMonth(parsedDate.getDate());
    },
    // metodo per normalizzare una data e ritornarla in formato YYYY-MM-DD
    normalizeDate(date) {
      const parts = date.split(/[\/\-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(
            2,
            "0"
          )}`;
        } else {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
            2,
            "0"
          )}`;
        }
      }
      return date; // restituisce la data se non riconosciuta
    },
    // metodo per formattare una data e ritornarla in formato DD-MM-YYYY
    formatDate(date) {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    // metodo asincrono per cercare le spese che fanno il match con la query
    async searchExpenses() {
      try {
        const response = await fetch(
          `/api/budget/search?q=${encodeURIComponent(this.searchQuery)}`
        ); // encodeURIComponent per fare l'encoding della query per assicurarsi che sia inclusa in maniera sicura nell'URL
        const data = await response.json();
        if (response.ok) {
          this.expenses = data;
          this.sortExpenses();
        } else {
          alert("Fallimento nella ricerca delle spese");
          console.error("Fallimento nella ricerca delle spese:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo per aggiungere un utente a sharedWith
    addUserToExpense(user) {
      this.newExpense.sharedWith.push({ username: user.username, share: "" });
      this.userQuery = "";
      this.users = [];
    },
    // metodo per rimuovere un utente da sharedWith
    removeUser(index) {
      this.newExpense.sharedWith.splice(index, 1);
    },
    // metodo per aggiungere un utente a sharedWith in editedExpense
    addEditedUser(user) {
      this.editedExpense.sharedWith.push({
        username: user.username,
        share: "",
      });
      this.userQuery = "";
      this.users = [];
    },
    // metodo per rimuovere un utente da sharedWith in editedExpense
    removeEditedUser(index) {
      this.editedExpense.sharedWith.splice(index, 1);
    },
    // metodo per gestire la scomparsa del dropdown
    handleClickOutside() {
      this.showDropdown = false;
    },
  },

  // una volta caricata l'istanza Vue nel DOM chiama fetchExpenses() e aggiunge un event listener per il click
  mounted() {
    this.fetchExpenses();
    // il listener chiamerà il metodo handleClickOutside ogni volta che ci sarà un click ovunque sulla pagina
    document.addEventListener("click", this.handleClickOutside);
  },
  // chiamato appena prima che il componente Vue sia rimosso dal DOM
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  // template per il budget
  template: `
    <div class="budget">
      <!-- titolo, che premendo si ritorna alla visualizzazione di tutte le spese -->
      <h1><a href="#" @click.prevent="fetchExpenses" style="text-decoration: none; color: #333" class="heading-expense">Your Expenses</a></h1>
      <button @click.prevent="toBalance" class="nav-button" id="balance-button">Your Balance</button>
      <input type="text" v-model="searchQuery" @input="searchExpenses" placeholder="Search expenses..." class="search-input">
      
      <!-- classe per gestire la lista delle spese: ogni spesa è composta da categoria, totale, descrizione e data.
      Premendo sulla categoria si apre un modal per visualizzarla nel dettaglio, vedendo anche con chi è stata condivisa. 
      Inoltre, premendo sul mese della spesa si filtrano tutte le spese a quelle di quel mese (e di quell'anno), e lo stesso vale per l'anno -->
      <div v-for="expense in expenses" :key="expense.description" class="expense-item">
        <span>
          <a href="#" @click.prevent="fetchExpenseId(expense)" class="expense-category">{{ expense.category }}</a>
          - {{ formatCurrency(expense.amount) }} - {{ expense.description }} - 
          {{ getDay(expense.date) }}/<a href="#" @click.prevent="handleDateClick(expense.year, expense.month)" class="date-expense">{{ formatMonth(expense.month) }}</a>/<a href="#" @click.prevent="handleDateClick(expense.year)" class="date-expense">{{ expense.year }}</a>
        </span>
        <button @click="editExpense(expense)">Edit</button>
        <button @click="deleteExpense(expense)">Delete</button>
      </div>

      <button @click="toggleAddExpenseForm" class="add-expense-button">+</button>

      <!-- modal per aggiungere spese -->
      <div v-if="showAddExpenseForm" 
        id="add-expense-modal"
        tabindex="-1" 
        aria-hidden="true" 
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add New Expense</h3>
              <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="add-expense-modal" @click="toggleAddExpenseForm">
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span class="sr-only">Close modal</span>
              </button>
            </div>
            <form class="p-4 md:p-5" @submit.prevent="addExpense">
              <div class="grid gap-4 mb-4 grid-cols-1">
              <div>
                <label for="new-date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                <input type="date" id="new-date" v-model="newExpense.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              <div>
                <label for="new-description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                <input type="text" id="new-description" v-model="newExpense.description" placeholder="Description" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              <div>
                <label for="new-category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                <input type="text" id="new-category" v-model="newExpense.category" placeholder="Category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              <div>
                <label for="new-amount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Total Amount</label>
                <input type="number" id="new-amount" v-model="newExpense.amount" placeholder="Total Amount" value="" step="0.01" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              
              <!-- possibilità di aggiungere utenti attraverso una ricerca -->
              <div>
                <label for="new-sharedWith" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shared With</label>
                <!-- Searchable input for adding users -->
                <div class="relative">
                    <input type="text" placeholder="Search user" v-model="userQuery" @input="fetchUsers(userQuery)" @click.stop class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                    <ul v-if="showDropdown && users.length" class="dropdown">
                        <li v-for="user in users" :key="user._id" @click="addUserToExpense(user)">
                            {{ user.username }}
                        </li>
                    </ul>
                </div>
                <!-- possibilità di vedere gli utenti che condividono la spesa -->
                <div v-for="(user, index) in newExpense.sharedWith" :key="index" class="flex items-center mb-2">
                    <input type="text" v-model="user.username" placeholder="User name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" readonly>
                    <input type="number" v-model="user.share" placeholder="Share" step="0.01" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                    <button type="button" @click="removeUser(index)" class="text-red-500 hover:text-red-700 ml-2">x</button>
                </div>
              </div>

              </div>
              <button type="submit" class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
              Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- modal per modificare spese -->
      <div v-if="showEditExpenseForm" 
        id="edit-expense-modal" 
        tabindex="-1" 
        aria-hidden="true" 
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
      <div class="relative p-4 w-full max-w-2xl max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Expense</h3>
            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="edit-expense-modal" @click="showEditExpenseForm = false">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
            </button>
          </div>
          <form class="p-4 md:p-5" @submit.prevent="updateExpense">
            <div class="grid gap-4 mb-4 grid-cols-1">
            <div>
              <label for="edit-date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
              <input type="date" id="edit-date" v-model="editedExpense.date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
            </div>
            <div>
              <label for="edit-description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <input type="text" id="edit-description" v-model="editedExpense.description" placeholder="Description" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
            </div>
            <div>
              <label for="edit-category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
              <input type="text" id="edit-category" v-model="editedExpense.category" placeholder="Category" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
            </div>
            <div>
              <label for="edit-amount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Total Amount</label>
              <input type="number" id="edit-amount" v-model="editedExpense.amount" placeholder="Total Amount" value="" step="0.01" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
            </div>

            <!-- possibilità di aggiungere utenti attraverso una ricerca -->
            <div>
              <label for="edit-sharedWith" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Shared With</label>
              <div class="relative">
                <input type="text" placeholder="Search user" v-model="userQuery" @input="fetchUsers(userQuery)" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                <ul v-if="users.length" class="dropdown">
                  <li v-for="user in users" :key="user._id" @click="addEditedUser(user)">
                    {{ user.username }}
                  </li>
                </ul>
              </div>
              <!-- possibilità di vedere gli utenti che condividono la spesa -->
              <div v-for="(user, index) in editedExpense.sharedWith" :key="index" class="flex items-center mb-2">
                <input type="text" v-model="user.username" placeholder="User name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" readonly>
                <input type="number" v-model="user.share" placeholder="Share" step="0.01" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                <button type="button" @click="removeEditedUser(index)" class="text-red-500 hover:text-red-700 ml-2">x</button>
              </div>
            </div>

            </div>
            <button type="submit" class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Update Expense
            </button>
          </form>
        </div>
      </div>
      </div>

      <!-- modal per visualizzare una spesa specifica -->
      <div v-if="selectedExpense"
        id="select-expense-modal"
        tabindex="-1"
        aria-hidden="true"
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- intestazione del modal -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Expense Details</h3>
                <button
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-hide="default-modal"
                  @click="clearSelectedExpense"
                >
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
                </button>
            </div>
            <!-- corpo del modal -->
            <div class="p-4 md:p-5 space-y-4">
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Category: {{ selectedExpense.category }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Description: {{ selectedExpense.description }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Amount: {{ formatCurrency(selectedExpense.amount) }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Date: {{ formatDate(selectedExpense.date) }}
              </p>
              <div v-if="selectedExpense.sharedWith && selectedExpense.sharedWith.length">
                <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  Shared With:
                </p>
                <ul>
                  <li v-for="user in selectedExpense.sharedWith" :key="user.username" class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {{ user.username }}: {{ formatCurrency(user.share) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="fetchUserInfo" class="user-info-button">?</button>
      <!-- modal per visualizzare le informazioni dell'utente -->
      <div v-if="userInfo !== null"
        id="user-info-modal"
        tabindex="-1"
        aria-hidden="true"
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- intestazione del modal -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">User Information</h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                @click="userInfo = null"
              >
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- corpo del modal -->
            <div class="p-4 md:p-5 space-y-4">
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Username: {{ userInfo?.username }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Name: {{ userInfo?.name }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Surname: {{ userInfo?.surname }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

const Balance = {
  data() {
    return {
      // dizionario dei bilanci
      balances: {},
      // query per ricerca e array relativo
      searchQuery: "",
      users: [],
      // serie di variabili per gestire i vari modal / dropdown
      userBalance: null,
      userInfo: null,
      commonExpenses: null,
      selectedUser: null,
      showDropdown: false,
    };
  },

  methods: {
    // metodo per andare alla visualizzazione budget
    toBudget() {
      this.$router.push("/budget");
    },
    // metodo asincrono per fare il fetch dei bilanci
    async fetchBalances() {
      try {
        const response = await fetch("/api/balance/");
        const data = await response.json();
        if (response.ok) {
          this.balances = data;
        } else {
          alert("Fallimento nel fetch dei bilanci");
          console.error("Fallimento nel fetch dei bilanci:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per fare il fetch del bilancio con un utente specifico
    async fetchBalanceWithUser(otherUserId) {
      try {
        const response = await fetch(`/api/balance/${otherUserId}`);
        const data = await response.json();
        if (response.ok) {
          this.userBalance = data.balance;
        } else {
          alert("Fallimento nel fetch del bilancio con l'utente");
          console.error(
            "Fallimento nel fetch del bilancio con l'utente:",
            data.msg
          );
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere gli utenti data una query
    async fetchUsers(query) {
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (response.ok) {
          this.users = data;
          this.showDropdown = true;
        } else {
          alert("Fallimento nel fetch degli utenti");
          console.error("Fallimento nel fetch degli utenti:", data.msg);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere le informazioni sull'utente loggato
    async fetchUserInfo() {
      try {
        const response = await fetch("/api/budget/whoami");
        const data = await response.json();
        if (response.ok) {
          this.userInfo = data;
        } else {
          alert("Fallimento nel fetch delle informazioni dell'utente");
          console.error(
            "Fallimento nel fetch delle informazioni dell'utente:",
            data.msg
          );
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo asincrono per ottenere le spese in comune con un utente specifico
    async fetchCommonExpenses(otherUsername) {
      try {
        const response = await fetch(
          `/api/balance/common-expenses/${otherUsername}`
        );
        const data = await response.json();
        if (response.ok) {
          this.commonExpenses = data;
          this.selectedUser = { username: otherUsername }; // ci salviamo lo username dell'utente specificato
        } else {
          alert("Fallimento nel fetch delle spese comuni");
          console.error("Fallimento nel fetch delle spese comuni");
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Si è verificato un errore. Si prega di riprovare.");
      }
    },
    // metodo per richiamare i metodo relativi ad un utente specifico
    selectUser(user) {
      this.searchQuery = user.username;
      this.users = [];
      this.fetchBalanceWithUser(user.username);
      this.fetchCommonExpenses(user.username);
    },
    // metodo per formattare una quantità in formato EUR
    formatCurrency(amount) {
      return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
    },
    // metodo per formattare una data e ritornarla in formato DD-MM-YYYY
    formatDate(date) {
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    // metodo per gestire la scomparsa del dropdown
    handleClickOutside() {
      this.showDropdown = false;
    },
  },

  // proprietà "reattive" che si aggiornano automaticamente se i valori che tracciano vengono modificati
  computed: {
    // calcoliamo il credito totale
    totalOwed() {
      return Object.values(this.balances).reduce(
        // .values(balances) recupera l'array dei valori da balances
        (sum, balance) => (balance > 0 ? sum + balance : sum), // se balance > 0 viene aggiunta a sum, altrimenti rimane uguale
        0 // sum inizializzato a 0
      );
    },
    // calcoliamo il debito totale
    totalDebt() {
      return Object.values(this.balances).reduce(
        // .values(balances) recupera l'array dei valori da balances
        (sum, balance) => (balance < 0 ? sum + Math.abs(balance) : sum), // se balance < 0 aggiungiamo il valore assoluto a sum, altrimenti rimane uguale
        0 // sum inizializzato a 0
      );
    },
  },

  // una volta caricata l'istanza Vue nel DOM chiama fetchBalances() e aggiunge un event listener per il click
  mounted() {
    this.fetchBalances();
    // il listener chiamerà il metodo handleClickOutside ogni volta che ci sarà un click ovunque sulla pagina
    document.addEventListener("click", this.handleClickOutside);
  },
  // chiamato appena prima che il componente Vue sia rimosso dal DOM
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  // template per il balance
  template: `
    <div class="balance-container">
      <h1>Your Balance</h1>
      <button @click.prevent="toBudget" class="nav-button">Your Expenses</button>

      <!-- seach box per la ricerca degli utenti, con dropdown contenente gli utenti -->
      <input type="text" v-model="searchQuery" @input="fetchUsers(searchQuery)" placeholder="Search user..." class="search-input" @click.stop>
      <ul v-if="showDropdown && users.length" class="balance-dropdown">
        <li v-for="user in users" :key="user._id" @click="selectUser(user)">
          {{ user.username }}
        </li>
      </ul>

      <!-- classe per visualizzare il totale dei crediti e dei debiti -->
      <div class="total-balances">
          <p>Credito totale: {{ formatCurrency(totalOwed) }}</p>
          <p>Debito totale: {{ formatCurrency(totalDebt) }}</p>
      </div>

      <!-- lista degli utenti con il bilancio -->
      <div v-for="(balance, user) in balances" class="balance-item">
        <span class="balance-list">{{ user }}: {{ formatCurrency(balance) }}</span>
      </div>

      <button @click="fetchUserInfo" class="user-info-button">?</button>
      <!-- modal per visualizzare le informazioni dell'utente -->
      <div v-if="userInfo !== null"
        id="user-info-modal"
        tabindex="-1"
        aria-hidden="true"
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- intestazione del modal -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">User Information</h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                @click="userInfo = null"
              >
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- corpo del modal -->
            <div class="p-4 md:p-5 space-y-4">
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Username: {{ userInfo?.username }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Name: {{ userInfo?.name }}
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Surname: {{ userInfo?.surname }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- modal per visualizzare le spese in comune -->
      <div v-if="commonExpenses !== null"
        id="common-expenses-modal"
        tabindex="-1"
        aria-hidden="true"
        class="fixed overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full"
      >
        <div class="relative p-4 w-full max-w-2xl max-h-full">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <!-- intestazione del modal -->
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Spese in comune con {{ selectedUser?.username }}</h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                @click="commonExpenses = null, searchQuery = ''"
              >
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
              </button>
            </div>
            <!-- corpo del modal -->
            <div class="p-4 md:p-5 space-y-4">
              <div v-if="userBalance !== null" class="user-balance">
                <span>Bilancio totale: {{ formatCurrency(userBalance) }}</span>
              </div>
              <ul>
                <li v-for="expense in commonExpenses" :key="expense._id" class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {{ expense.description }} - {{ formatCurrency(expense.amount) }} - {{ formatDate(expense.date) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

// definiamo le rotte per l'applicazione
const routes = [
  { path: "/", component: Home },
  { path: "/budget", component: Budget },
  { path: "/balance", component: Balance },
];

// nuova istanza VueRouter
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(), // utilizza la modalità hash per il routing
  routes,
});

const App = {
  template: `
    <!-- contenitore per tutta l'applicazione -->
    <div class="container">
      <router-view></router-view>
    </div>
  `,
};

createApp(App).use(router).mount("#app");
