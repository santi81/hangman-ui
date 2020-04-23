sap.ui.define(
	["jquery.sap.global",
		"sap/m/Button",
		"sap/ui/layout/form/SimpleForm", "sap/m/VBox", "sap/m/HBox", "sap/m/Label", "sap/m/Input", "sap/m/List",
		"sap/m/StandardListItem", "sap/ui/unified/FileUploader", "sap/m/MessageToast", "sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel", 'sap/m/MessageBox', 'sap/ui/core/Fragment'
	],
	function (jQuery, Button, SimpleForm, VBox, HBox, Label, Input, List, StandardListItem,
			FileUploader, MessageToast, Controller, JSONModel,  MessageBox, Fragment) {
		"use strict";
		var _timeout;
		var uploadedData = "";

		var loginPageController = Controller.extend(
			"hangman.controller.gamepage", {

				/**
				 * Called when a controller is
				 * instantiated and its View controls
				 * (if available) are already created.
				 * Can be used to modify the View before
				 * it is displayed, to bind event
				 * handlers and do other one-time
				 * initialization.
				 *
				 * @memberOf sap-ui5-poc.loginpage
				 */
				onInit: function () {


				},

				onBeforeRendering: function () {
                    try {
                        var game_id = window.location.href.split("/")[4]
                        if (game_id){
                            this.getGameData(game_id)
                        }
                    }
                    catch (oException) {
                        //Game not started yet
                    }

				},

                handlePopoverPress: function (oEvent) {
                            var oButton = oEvent.getSource();
                            var oModel = new sap.ui.model.json.JSONModel({
                                helpText: '<p><strong> To Start a New Game:</strong></p>\n' +
                                            '<ul>' +
                                            '<li>Click on "New Game" </li>' +
                                            '</ul>'
                                            })

                            // create popover
                            if (!this._oPopover) {
                                Fragment.load({
                                    name: "hangman.fragment.Popover",
                                    controller: this
                                }).then(function(pPopover) {
                                    this._oPopover = pPopover;
                                    this.getView().addDependent(this._oPopover);
                                    this._oPopover.setModel(oModel);
                                    this._oPopover.openBy(oButton);
                                }.bind(this));
                            } else {
                                this._oPopover.openBy(oButton);
                            }
                },


				createNewGame: function (oEvent) {
					var that = this;
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/api/createGame/',
                                dataType: "json",
                                data: JSON.stringify({}),
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    //redirect to a URL

                                    var new_url = window.location.href.split("hangman")[0] +'hangman/'+ data.game_id
                                    window.location.replace(new_url);


                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                      sap.ui.core.BusyIndicator.hide();
                                      MessageToast.show("Error. Please contact technical support!");

                                }
                            })


				},
                getGameData: function(game_id){
                    var that = this;
                    var oView = this.getView();
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "GET",
                                contentType: "application/json",
                                url: '/api/retrieveGame/'+game_id,
                                dataType: "json",
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    var oModelGuesses = new sap.ui.model.json.JSONModel();
                                    var guesses_data, word_data, char_count, list_char

                                    //new word
                                    word_data= {"word": data.status.word}
                                    var oModelWord = new sap.ui.model.json.JSONModel();
                                    oModelWord.setData(word_data)
                                    var idWord= that.byId("idWord");
                                    idWord.setModel(oModelWord);

                                    //Characters
                                    var char_data = { "chars":["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
                                                         "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
                                                         "W", "X", "Y", "Z"],
                                                       "num_guesses_left": data.guesses.num_guesses_left}

                                    var oModelChar = new sap.ui.model.json.JSONModel();
                                    oModelChar.setData(char_data)
                                    var idCharList= that.byId("idCharList");
                                    idCharList.setModel(oModelChar);

                                    //Set GameID to controller and update used_char array
                                    that.game_id = data.game_id
                                    that.used_char = data.status.wrong_guesses
                                    that.used_char.push.apply(that.used_char,data.status.word)
                                    sap.ui.core.BusyIndicator.hide();

                                    if (data.status.game_over === true){
                                        MessageBox.information("Game over! Click on 'New Game' to start again!", {title: "Game Over"})
                                        oView.byId("BlockLayout").setBusy(true)
                                    }

                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Error. Please contact technical support!");
                                }
                            })

                },
				submitGuess: function(oEvent){
				    var that = this;
			        var oView = this.getView();
			        var oInputChar = oEvent.getSource()
                    var guessed_char = oInputChar.getText()

                    sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/api/submitGuess/',
                                dataType: "json",
                                data:JSON.stringify({"game_id": that.game_id, "guess": guessed_char}),
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    var guesses_data, word_data, char_count, list_char

                                    //update word model
                                    word_data= {"word": data.status.word}
                                    var idWord= that.byId("idWord");
                                    var oModelWord = idWord.getModel();
                                    oModelWord.setData(word_data)

                                    //Update num_guesses_left
                                    var char_data = oView.byId('idCharList').getModel().getData()
                                    char_data.num_guesses_left = data.guesses.num_guesses_left
                                    oView.byId('idCharList').getModel().setData(char_data)

                                    //Set State and Type for guessed char button
                                    oInputChar.setPressed("true");
                                    oInputChar.setEnabled(false);
                                    if (data.status.wrong_guesses.indexOf(guessed_char)!= -1){
                                        oInputChar.setType("Reject");
                                    }
                                    else{
                                        oInputChar.setType("Accept");

                                    }


                                    //Update used_char array
                                    that.used_char = data.status.wrong_guesses
                                    that.used_char.push.apply(that.used_char,data.status.word)

                                    sap.ui.core.BusyIndicator.hide();

                                    if (data.status.game_over === true){
                                        if (data.guesses.num_guesses_left > 0) {
                                            MessageBox.success("You Won the Game!", {title: "Game Won"})
                                        }
                                        else{
                                            MessageBox.error("You Lost the Game. Try Again", {title: "Game Lost"})
                                        }
                                        oView.byId("BlockLayout").setBusy(true)
                                    }


                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Error. Please contact technical support!");
                                }
                            })
				}

			});
		return loginPageController;
	});