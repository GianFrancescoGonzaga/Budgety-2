// Budget Controller
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage= -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
      return this.percentage;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            ID = 0;

            // ID = last ID + 1
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new items
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Insert into data structure
            data.allItems[type].push(newItem);
            // return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            var index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentage(data.totals.inc);
            });

        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();

// UI Controller (Handles UI)
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: 'item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');

        var int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        var dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create html string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-' + obj.id +'"><div class="item__description">' + obj.description + '</div><div class="right clearfix"><div class="item__value">' + formatNumber(obj.value, type) + '</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-' + obj.id + '"><div class="item__description">'+ obj.description + '</div><div class="right clearfix"><div class="item__value">' + formatNumber(obj.value, type) + '</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // Replace placeholder text with some actual data
            console.log(html);
            // console.log(html.replace('%description%', 'sad'));
            // html.replace('%description%', 'sad');
            // newHtml = html.replace('%id%', obj.id);
            // newHtml = newHtml.replace('%description%', 'sad1');
            // newHtml = newHtml.replace('%value%', obj.value);
            // Insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            var fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);



            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
          var now = new Date();
          var year = now.getFullYear();
          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          var month = now.getMonth();
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('.red-focus');
             });
        },



        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

// Main controller (Acts as API between UI and Budget Controller)
var controller = (function(budgetCtrl, UICtrl) {
        var setupEventListeners = function() {
            var DOM = UICtrl.getDOMstrings();
            document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', function(event) {
                if(event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }

            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
            });

            // Delete items
            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        };

        var updateBudget = function() {
            // Calculate the budget
            budgetCtrl.calculateBudget();
            // Return the budget
            var budget = budgetCtrl.getBudget();
            // Display the budget
            UICtrl.displayBudget(budget);
        };

        var updatePercentages = function() {

            // Calculate PercentageWs
            budgetCtrl.calculatePercentages();
           // Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentage();
            // Update the ui with the new percentages
            UICtrl.displayPercentages(percentages);
            console.log(percentages);

        };

        var ctrlAddItem = function() {
            var input, newInput;

            // Get the field input data
            input  = UICtrl.getInput();

            if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
                // Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);
                // Add the item to the UI
                UICtrl.addListItem(newItem, input.type);
                // Clear the fields
                UICtrl.clearFields();
                // Calculate and update budget
                updateBudget();
                //  Calculate and update perecentages
                updatePercentages();
            }

        };

        var ctrlDeleteItem = function(event) {
            var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if(itemID) {
                //inc-1
                var splitID = itemID.split('-');
                var type = splitID[0];
                var ID = parseInt(splitID[1]);

                // Delete item from data structure
                budgetCtrl.deleteItem(type, ID);
                // Delete item from the user interface
                UICtrl.deleteListItem(itemID);
                // Update and show the new budget
                updateBudget();
                //  Calculate and update perecentages
                updatePercentages();
            }
        };

        return {
            init: function() {
                console.log('app has started');
                UICtrl.displayBudget({
                        budget: 0,
                        totalInc: 0,
                        totalExp: 0,
                        percentage: -1
                    });
                setupEventListeners();
                UICtrl.displayMonth();
            }


        };

})(budgetController, UIController);

controller.init();