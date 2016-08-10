var _$ = new JavaImporter(
	java.lang,
	javafx.application,
	javafx.scene,
	javafx.scene.control,
	javafx.scene.layout,
	Packages.cn.nukkit.command,
	Packages.cn.nukkit.utils
);

var statementArea, resultArea;
var thiz = this;

var mApplication = Java.extend(Java.type("javafx.application.Application"), {
	start: function(stg){
		PldrJS.Stage = stg;
	}
});

new _$.Thread(function(){
	_$.Application.launch(mApplication.class);
}).start();

PldrJS.registerCommand('repl', 'Starts REPL Mode.', '/repl');
PldrJS.command('repl', function(command, sender, label, args){
	if(!(sender instanceof _$.ConsoleCommandSender)){
		sender.sendMessage(_$.TextFormat.RED + 'Please run this command in console');
		return;
	}

	_$.Platform.runLater(() => {
		statementArea = new _$.TextArea();
		statementArea.setPrefColumnCount(50);
		statementArea.setPrefRowCount(30);
		statementArea.setPromptText("Enter statement here.");

		resultArea = new _$.TextArea();
		resultArea.setPrefColumnCount(50);
		resultArea.setPrefColumnCount(10);
		resultArea.setDisable(true);
		resultArea.setStyle("-fx-opacity: 1.0;");

		var evalButton = new _$.Button("Evaluate");
		evalButton.setMaxWidth(_$.Double.MAX_VALUE);
		evalButton.setOnAction(() => {
			new _$.Thread(() => {
				var startTime = Date.now();
				var value = (new Function(statementArea.getText())).apply(thiz, []);
				var elapsedTime = Date.now() - startTime;
				_$.Platform.runLater(() => {
					resultArea.setText(value + "\nElapsed Time : " + elapsedTime + "ms");
				});
			}).start();
		});

		var cc = new _$.ColumnConstraints();
		cc.setFillWidth(true);
		cc.setHgrow(_$.Priority.ALWAYS);

		var rc = new _$.RowConstraints();
		rc.setFillHeight(true);
		rc.setVgrow(_$.Priority.ALWAYS);

		var rootPane = new _$.GridPane();
		rootPane.getColumnConstraints().add(cc);
		rootPane.getRowConstraints().add(rc);
		rootPane.add(new _$.Label("Statement"), 0, 0);
		rootPane.add(statementArea, 0, 1);
		rootPane.add(evalButton, 0, 2);
		rootPane.add(resultArea, 0, 3);

		var scene = new _$.Scene(rootPane);
		PldrJS.Stage.setScene(scene);
		PldrJS.Stage.setTitle("REPL");
		PldrJS.Stage.show();
	});
});
