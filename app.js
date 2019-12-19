// BUDGET CONTROLLER
const BudgetController = (() => {
	
	class Expense {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		}
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
 
	class Income {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}
	}
	
	const data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		},
		budget: 0,
		percentage: -1, // -1 means that the percentage doesn't exist at the initial point
	};

	const calculateTotal = function(type) {
		let sum = 0;
		data.allItems[type].forEach((i) => {
			sum += i.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, desc, val) {
			let newItem, ID;

			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create new item
			if (type === 'exp'){
				newItem = new Expense(ID, desc, val);
			} else if (type === 'inc'){
				newItem = new Income(ID, desc, val);
			}

			// push it into our data structure
			data.allItems[type].push(newItem);

			// return the new element
			return newItem;
		},

		deleteItem: function(type, id){
			let ids, index;
			ids = data.allItems[type].map((cur) => {
				return cur.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			
			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent (only if the income is not zero)
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
		},

		calculatePercentages: function () {
			data.allItems.exp.forEach((i) => {
				i.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function (){
			const allPerc = data.allItems.exp.map((i) => {
				return i.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},

		testing: function() {
			console.log(data);
		}
	}
})();


// UI CONTROLLER
const UIController = (function() {

	const DOMStrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
	};

	const formatNumber = function(num, type) {
		let numSplit, int, dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	}

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // will be inc or exp
				description: document.querySelector(DOMStrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
			};
		},

		addListItem: function(obj, type) {
				// create html string with placeholder text
				let html, newHtml, element;

				if(type === 'inc'){
					element = DOMStrings.incomeContainer;

					html = 
					`
					<div class="item clearfix" id="inc-%id%">
						<div class="item__description">%description%</div>
						<div class="right clearfix">
							<div class="item__value">%value%</div>
							<div class="item__delete">
									<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
							</div>
						</div>
					</div>
					`
				} else if (type === 'exp') {
					element = DOMStrings.expensesContainer;

					html =
					`
					<div class="item clearfix" id="exp-%id%">
						<div class="item__description">%description%</div>
						<div class="right clearfix">
								<div class="item__value">%value%</div>
								<div class="item__percentage">21%</div>
								<div class="item__delete">
										<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
								</div>
						</div>
					</div>
					` 
				}

				// replace placeholder text with actual data
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

				// insert html into the dom
				document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: (selectorID) => {
			let el = 	document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: () => {
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
			fieldsArr = Array.from(fields);
			fieldsArr.forEach((i) => {
				i.value = '';
			});
			fieldsArr[0].focus();
		},

		displayBudget: function(obj) {
			let type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
			
			if(obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%`;
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			const fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

			const nodeListForEach = function(list, cb) {
				for (let i = 0; i < list.length; i++) {
					cb(list[i], i);
				}
			}

			nodeListForEach(fields, function(cur, index) {
				if(percentages[index] > 0){
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '---';
				}
			});
		},

		getDOMStrings: () => {
			return DOMStrings;
		}
	};

})();



// GLOBAL APP CONTROLLER
const Controller = ((budgetCtrl, UIctrl) => {

	const setupEvetnListeners = () => {
		const DOM = UIctrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', (e) => {
			if(e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	};


	const updateBudget = () => {

		// 1. Calculate the budget
		BudgetController.calculateBudget();

		// 2. Return the budget
		const budget = budgetCtrl.getBudget();
	
		// 3. Display the budget on the UI
		UIctrl.displayBudget(budget);

	};


	const updatePercentages = function() {

		// 1. calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. read them from budget controller
		const percentages = budgetCtrl.getPercentages();

		// 3. update the ui with new percentages
		UIctrl.displayPercentages(percentages);

	};


	const ctrlAddItem = function() {
		
		// 1. Get the field input data
		const input = UIctrl.getInput();
	
		if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		
			// 3. Add the item to the UI
			UIctrl.addListItem(newItem, input.type);
	
			// 4. Clear the fields
			UIctrl.clearFields();
		
			// 5. Calculate and update budget
			updateBudget();

			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	const ctrlDeleteItem = (e) => {
		let itemID, splitID, type, ID;
		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
		}

		// 1. Delete the item from the data structure
		budgetCtrl.deleteItem(type, ID);

		// 2. Delete the item from the UI
		UIctrl.deleteListItem(itemID);

		// 3. Update and show the new budget
		updateBudget();

		// 4. Calculate and update percentages
		updatePercentages();
	};

	return {
		init: () => {
			console.log('app started');
			UIctrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
			setupEvetnListeners();
		}
	}

})(BudgetController, UIController); 

Controller.init();
