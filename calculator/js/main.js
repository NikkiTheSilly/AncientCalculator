var Decimal = require('decimal.js');

// Require modules
require('jquery');
Popper = require('popper.js');
require('bootstrap');
require('bootstrap-slider');
require('lodash');

// Application libraries
var utils = require(__dirname + '/utils.js');
var calculator = require(__dirname + '/calc.js');

// Application data model
var model = require(__dirname + '/data/model.js');

// Bindings
$(document).ready(function () {
    $('#import').on("click", function () {
        console.log("Working...");
        importSaveGame(true);
    });
    
    $('#addsouls, #wep8k, #scouts, #copyancientlevels, [name="buildmode"], #keepsoulsforregilding, #ignoreminimizedancients')
    .on("click", function () {
        console.log("Working...");
        importSaveGame();
    });
    
    $("#soulsin").on("blur", function () {
        console.log("Working...");
        manualHeroSoulEntry();
    });
    
    $('#addsouls').change(function () {
        saveSettingCheckBox("#addsouls");
    });

    $('#wep8k').change(function () {
        saveSettingCheckBox("#wep8k");
    });

    $('#scouts').change(function () {
        saveSettingCheckbox("#scouts")
    });

    $('#copyancientlevels').change(function () {
        saveSettingCheckBox('#copyancientlevels');
    });

    $('#displayadvancedconfiguration').change(function () {
        saveSettingCheckBox('#displayadvancedconfiguration');
        showHideAdvancedConfigurationContainer();
    });
    
    $('#displaysavegamegeneration').change(function () {
        saveSettingCheckBox('#displaysavegamegeneration');
        showHideGeneratedSaveGameContainer();
    });

    $("input[name=buildmode]:radio").change(function () {
        saveBuildMode();
        showHideHybridRatioContainer();
    });
    
    $("input[name=theme]:radio").change(function () {
        saveTheme();
        setTheme();
    });

    $("#hybridratio").change(function () {
        saveSettingField("#hybridratio");
    });

    $("#revolcrate").change(function () {
        saveSettingField("#revolcrate");
    });

    $("#skillancientsrate").change(function () {
        saveSettingField("#skillancientsrate");
    });
    
    $("#precision").change(function () {
        saveSettingField("#precision");
    });

    $('#keepsoulsforregilding').change(function () {
        saveSettingCheckBox("#keepsoulsforregilding");
    });

    $('#ignoreminimizedancients').change(function () {
        saveSettingCheckBox("#ignoreminimizedancients");
    });

    $('#collapseancienttableonsmallscreens').change(function () {
        saveSettingCheckBox("#collapseancienttableonsmallscreens");
        doOrDoNotCollapseAncientTableOnSmallScreens();
    });

    $('#import-button').click(function(){
        // collapse if small
        if($("#input-collapse-btn").is(":visible") && $("#input-collapse").is(":visible")){
            $("#input-collapse").collapse('hide');
            $("#config-collapse").collapse('hide');
        }
    });
    
    $('#generatedsavedata').on('focus click', function () {
        $(this).select();
        if ($("#copyancientlevels").prop("checked") && document.queryCommandSupported('copy')) {
            document.execCommand('copy');
        }
    });
    
    // Load settings
    loadAllSettings();

    window.data = require(__dirname + '/data/ClickerHeroes_v14307.json');
    model.createObjects(data);
    window.Items = {items: {}, slots: {}};    // No relics.
    showTables();
    
    // Set up hybrid ratio slider
    $('#hybridratio').slider({
        formatter: function (value) {
            return value;
        },
        value: Number($('#hybridratio').val())
    });
    $('#hybridratio').on("slideStop", function () {
        importSaveGame();
    });
    showHideHybridRatioContainer();

    // Set up revolc level rate slider
    $('#revolcrate').slider({
        formatter: function (value) {
            return value;
        },
        value: Number($('#revolcrate').val())
    });
    $('#revolcrate').on("slideStop", function () {
        importSaveGame();
    });

    // Set up skill ancients level rate slider
    $('#skillancientsrate').slider({
        formatter: function (value) {
            return value;
        },
        value: Number($('#skillancientsrate').val())
    });
    $('#skillancientsrate').on("slideStop", function () {
        importSaveGame();
    });
    
    // Set up precision slider
    $('#precision').slider({
        formatter: function (value) {
            return value;
        },
        value: Number($('#precision').val())
    });
    $('#precision').on("slideStop", function () {
        importSaveGame();
    });

    // Show or hide the advanced configuration container
    showHideAdvancedConfigurationContainer();

    // Show or hide the generated save game container
    showHideGeneratedSaveGameContainer()

    // Do or do not collapse the ancient table on small screens
    doOrDoNotCollapseAncientTableOnSmallScreens();
});

function loadAllSettings() { 
    var strSettingsCheckBox = [
        "#addsouls",
        "#wep8k",
        "#scouts",
        "#copyancientlevels",
        "#displayadvancedconfiguration",
        "#displaysavegamegeneration",
        "#keepsoulsforregilding",
        "#ignoreminimizedancients",
        "#collapseancienttableonsmallscreens"
    ];

    var strSettingsRadio = [
        "buildmode",
        "theme"
    ];

    var strSettingsList = [
        "#hybridratio",
        "#revolcrate",
        "#skillancientsrate",
        "#precision"
    ];

    var strCustomSave = [];
    
    if (typeof(Storage) !== "undefined") {
        for (var i in strCustomSave) {
            if (localStorage.hasOwnProperty(i)) {
                strCustomSave[i] = localStorage[i];
            }
        }

        for (var i in strSettingsCheckBox) {
            var str = strSettingsCheckBox[i];
            if (localStorage.hasOwnProperty(str)) {
                $(str).prop('checked', localStorage[str] == "true");
            }
        }

        for (var i in strSettingsRadio) {
            var str = strSettingsRadio[i];
            if (localStorage.hasOwnProperty(str)) {
                $('input[name="' + str + '"][value="' + localStorage[str] + '"]').prop('checked', true);
            }
        }

        // Now the other settings.
        for (var i in strSettingsList) {
            var str = strSettingsList[i];
            if (localStorage.hasOwnProperty(str)) {
                $(str).val(localStorage[str]);
            }
        }
    }
}

var saveSettingError = false;
function saveSetting(key, val) {
    if (typeof(Storage) !== "undefined") {
        try {
            localStorage[key] = val;
        } catch (e) {
            if (!saveSettingError) {
                saveSettingError = true;
                
                showModal('En error occurred (in the spelling too apparently)', '<p>Your browser prevented settings from being saved.</p><p>The error given was:</p><p><code>' + e + '</code></p>');
            }
        }
    }
}

function saveSettingField(strSetting) {
    saveSetting(strSetting, $(strSetting).val());
}

function saveSettingCheckBox(strSetting) {
    saveSetting(strSetting, $(strSetting).prop('checked'));
}

function saveBuildMode() {
    var strBuildMode = $('input[name="buildmode"]:checked').val();
    saveSetting("buildmode", strBuildMode);
}

function saveTheme() {
    var strTheme = $('input[name="theme"]:checked').val();
    saveSetting("theme", strTheme);
}

function showHideHybridRatioContainer() {
    if ($('input[name="buildmode"]:checked').val() == "hybrid") {
        $("#hybridratiocontainer").show();
    } else {
        $("#hybridratiocontainer").hide();
    }
}

function setTheme() {
    if ($('input[name="theme"]:checked').val() == "light") {
        $("#theme-light").prop("disabled", false);
        $("#theme-dark").prop("disabled", true);
    } else {
        $("#theme-light").prop("disabled", true);
        $("#theme-dark").prop("disabled", false);
    }
}

function showHideAdvancedConfigurationContainer() {
    if ($("#displayadvancedconfiguration").prop('checked')) {
        $("#advancedconfiguration").show();
    } else {
        $("#advancedconfiguration").hide();
    }
}

function showHideGeneratedSaveGameContainer() {
    if ($("#displaysavegamegeneration").prop('checked')) {
        $("#generatedsavedatacontainer").show();
    } else {
        $("#generatedsavedatacontainer").hide();
    }
}

function doOrDoNotCollapseAncientTableOnSmallScreens() {
    var checked = $("#collapseancienttableonsmallscreens").prop('checked');
    if (checked) {
        $("#ancienttbl").addClass('verticalize');
    } else {
        $("#ancienttbl").removeClass('verticalize');
    }
}

function configureDecimal(precision) {
    Decimal.config({
        precision: precision
    });
}

function AddAncient(key) {
    data.ancients[key].ui = {};

    var tr = data.ancients[key].ui.targetBox = $("<tr></tr>");
    tr.append($("<td></td>").addClass("col1").append(data.ancients[key].used).append($("<span></span>").text(data.ancients[key].name.substring(0, data.ancients[key].name.indexOf(','))).attr("title", data.ancients[key].name)));
    data.ancients[key].level = 0;
    data.ancients[key].ui.level = $("<span></span>").text(utils.numberToStringFormatted(0));
    data.ancients[key].ui.goal = $("<span></span>").text(utils.numberToStringFormatted(0));
    data.ancients[key].ui.change = $("<input></input>").attr("readonly", "readonly").attr("type", "text").addClass("col_change");
    data.ancients[key].ui.cost = $("<span></span>").text(utils.numberToStringFormatted(0));

    var changeSelectFunction = function () {
        $(this).val(utils.numberToClickerHeroesPasteableString(data.ancients[key].extraInfo.optimalLevel.minus(data.ancients[key].level)));
        $(this).select();
        if (data.settings.copyAncientLevelsToClipboard && document.queryCommandSupported('copy')) {
            document.execCommand('copy');
        }
    };
    /* Bind to both the focus and the click event */
    data.ancients[key].ui.change.focus(changeSelectFunction);
    data.ancients[key].ui.change.click(changeSelectFunction);


    data.ancients[key].ui.change.focusout(function () {
        $(this).val(utils.numberToStringFormatted(data.ancients[key].extraInfo.optimalLevel.minus(data.ancients[key].level)));
    });

    tr.append($("<td></td>").addClass("col2").append(data.ancients[key].ui.level))
        .append($("<td></td>").addClass("col3").append(data.ancients[key].ui.goal))
        .append($("<td></td>").addClass("col4").append(data.ancients[key].ui.change))
        .append($("<td></td>").addClass("col5").append(data.ancients[key].ui.cost));
    $("#ancienttbl").append(tr);
    tr.hide();
}

function addOutsider(key) {
    data.outsiders[key].ui = {};

    var tr = $("<tr></tr>");
    tr.append($("<td></td>").append($("<span></span>").text(data.outsiders[key].name)));
    data.outsiders[key].ui.level = $("<span></span>").text(utils.numberToStringFormatted(0));
    tr.append($("<td></td>").append(data.outsiders[key].ui.level));
    $("#outsidertbl").append(tr);
}

function showTables() {
    var ancientList = _.keys(data.ancients).sort();

    // Ancient Tab
    for (var i = 0; i < ancientList.length; i++) {
        var key = ancientList[i];
        if (!data.ancients[key].maxLevel) {
            AddAncient(key);
        }
    }

    for (var i = 0; i < ancientList.length; i++) {
        var key = ancientList[i];
        if (data.ancients[key].maxLevel) {
            AddAncient(key);
        }
    }

    // data.outsiders Tab
    for (var k in data.outsiders) {
        addOutsider(k);
    }
}

var ToPurchase = [1, 2, 4, 8, 16, 35, 70, 125, 250, 500, 800, 1200, 1700, 2200, 2750, 3400, 4100, 5000, 6000, 7500, 10000, 12500, 16000, 25000, 35000, 50000, 70000, 100000, 150000, 250000, 400000];

var ItemTypeMap = {
    "1": "siyalatas",
    "2": "fragsworth",
    "3": "chronos",
    "4": "chawedo",
    "5": "revolc",
    "6": "iris",
    "7": "argaiv",
    "8": "energon",
    "9": "kleptos",
    "10": "sniperino",
    "11": "berserker",
    "12": "hecatoncheir",
    "13": "bubos",
    "14": "morgulis",
    "15": "bhaal",
    "16": "dora",
    "17": "atman",
    "18": "fortuna",
    "19": "dogcog",
    "20": "pluto",
    "21": "mimzee",
    "22": "mammon",
    "24": "libertas",
    "25": "solomon"
};

function SetDifference(a, b) {
    var cnt = 0;
    for (var k in b) {
        if (!a.hasOwnProperty(k)) {
            cnt++;
        }
    }
    return cnt;
}

function showModal(title, content, btn) {
    // btn = "Get it" default
    btn = utils.defaultFor(btn, "Got it");
    
    $('#modal-title').html(title);
    $('#modal-body').html(content);
    $('#modal-btn').html(btn);
    $('#modal').modal();
}

function importSaveGame(force) {
    // force = false default
    force = utils.defaultFor(force, false);
    
    var saveData = $("#savedata").val()
    
    if (!saveData && !force) {
        return;
    }
    
    try {
        var rawDataAlgo = utils.decodeSaveGame(saveData);
    } catch (e) {
        showModal('Oops!', '<p>Could not decode the save game data.</p><p>The error given was:</p><p><code>' + e + '</code></p>', 'Close');
        throw e;
    }
    
    try {
        var rawData = rawDataAlgo.data;
        
        // Create data structure
        data.settings = {};
        
        // Store the save-file encoding algorithm used
        data.encodeAlgo = rawDataAlgo.algo;
        
        // Read on-page settings
        data.settings.includeSoulsAfterAscension = $("#addsouls").prop("checked");
        data.settings.wep8k = $("#wep8k").prop("checked");
        data.settings.scouts = $("#scouts").prop("checked");
        data.settings.copyAncientLevelsToClipboard = $("#copyancientlevels").prop("checked");
        data.settings.buildMode = $('input[name="buildmode"]:checked').val();
        data.settings.hybridRatio = $('#hybridratio').slider('getValue');
        data.settings.revolcLevelRate = $('#revolcrate').slider('getValue');
        data.settings.skillAncientsLevelRate = $('#skillancientsrate').slider('getValue');
        data.settings.precision = $('#precision').slider('getValue');
        data.settings.keepSoulsForRegilding = $("#keepsoulsforregilding").prop("checked");
        data.settings.ignoreMinimizedAncients = $("#ignoreminimizedancients").prop("checked");

        // Set precision
        configureDecimal(Math.ceil(data.settings.precision) + 3);
        
        // Older saves won't have items.
        data.items = rawData.hasOwnProperty("items") ? rawData.items : {items: {}, slots: {}};
        
        data.heroSoulsSacrificed = new Decimal(rawData.heroSoulsSacrificed);

        // Calculate total HS earned
        data.totalHSEarned = data.heroSoulsSacrificed.plus(new Decimal(rawData.heroSouls));
        for (var k in rawData.ancients.ancients) {
            data.totalHSEarned = data.totalHSEarned.plus(new Decimal(rawData.ancients.ancients[k].spentHeroSouls));
        }

        var heroes = rawData.heroCollection.heroes;
        var ascensionSouls = new Decimal(0);
        for (var k in heroes) {
            var id = parseInt(k, 10);
            ascensionSouls = ascensionSouls.plus(new Decimal(heroes[k].level));
        }
        ascensionSouls = ascensionSouls.dividedBy(2000).floor().plus(new Decimal(rawData.primalSouls));
        data.ascensionSouls = ascensionSouls;

        var levels = {};
        for (var i = data.ancientMin; i <= data.ancientMax; i++) {
            if (rawData.ancients.ancients.hasOwnProperty(i)) {
                levels[i] = true;
            }
        }


        data.heroSouls = new Decimal(rawData.heroSouls);
        if (data.settings.includeSoulsAfterAscension) {
            data.heroSouls = data.heroSouls.plus(data.ascensionSouls);
        }
        $("#soulsin").val(utils.numberToString(data.heroSouls.floor()));

        // Calculate number of gilds
        data.gilds = new Decimal(Math.max((Number(rawData.epicHeroReceivedUpTo) - 90) / 10, 0) + Number(rawData.extraGildsAwarded));

        for (var k in data.ancients) {
            if (data.ancients.hasOwnProperty(k)) {
                if (rawData.ancients.ancients[data.ancients[k].id]) {
                    data.ancients[k].level = new Decimal(rawData.ancients.ancients[data.ancients[k].id].level);

                    // Currently it's possible to own a decimal number of ancients due to a bug.
                    // The game treats the ancient level as being rounded down (at least for calculating cost).
                    // So round down the ancient level to be safe:
                    data.ancients[k].level = data.ancients[k].level.floor();
                } else {
                    data.ancients[k].level = new Decimal(0);
                }

                // Check whether the ancient is minimized in the game or not
                data.ancients[k].minimized = rawData.ancientEntrySizes.hasOwnProperty(data.ancients[k].id);

                data.ancients[k].ui.level.text(utils.numberToStringFormatted(data.ancients[k].level));
            }
        }

        for (var k in data.outsiders) {
            if (data.outsiders.hasOwnProperty(k)) {
                if (rawData.outsiders.outsiders[data.outsiders[k].id]) {
                    data.outsiders[k].level = new Decimal(rawData.outsiders.outsiders[data.outsiders[k].id].level);
                } else {
                    data.outsiders[k].level = new Decimal(0);
                }
                data.outsiders[k].ui.level.text(utils.numberToStringFormatted(data.outsiders[k].level));
            }
        }

        data.ascensionZone = new Decimal(rawData.highestFinishedZonePersist);
        $("#ascensionzone").val(data.ascensionZone);

        data.ancientSoulsTotal = new Decimal(rawData.ancientSoulsTotal);
        $("#astotal").val(data.ancientSoulsTotal);

        var tpAncientSoulsPart = new Decimal(0.25).minus(new Decimal(0.23).times(data.ancientSoulsTotal.times(-0.0003).exp())).times(100);
        data.tp = Decimal.max(tpAncientSoulsPart, new Decimal(1));

        if (!rawData.transcendent) {
            data.tp = new Decimal(0);
        }

        $("#tp").val(utils.numberToString(data.tp));

        $("#gilds").val(data.gilds);

        data.useSoulsEnteredManually = false;
    } catch (e) {
        showModal('An error occurred', '<p>The save game data appears to be malformed.</p><p>The error given was:</p><p><code>' + e + '</code></p>', 'Close');
        throw e;
    }
    
    // Calculate
    var dateTimeBefore = new Date();
    try {
        calculateAndUpdate();
    } catch (e) {
        showModal('An error occurred', '<p>Something went wrong while calculating.</p><p>The error given was:</p><p><code>' + e + '</code></p>', 'Close');
        throw e;
    }
    
    var dateTimeAfter = new Date();
    
    var elapsed = dateTimeAfter - dateTimeBefore;
    $("#calculationtime").html("Calculation took " + utils.numberToString(elapsed / 1000, 3) + " seconds");
    
    // Enable field to enter available HS manually
    $('#soulsin').prop('disabled', false);
}

function calculateAndUpdate() {
    // Calculate the amount of souls we will use for leveling
    if (data.useSoulsEnteredManually) {
        data.heroSoulsForLeveling = new Decimal($("#soulsin").val());
    } else {
        data.heroSoulsForLeveling = data.heroSouls;
    }

    if (data.settings.keepSoulsForRegilding) {
        data.heroSoulsForLeveling = data.heroSoulsForLeveling.minus(data.gilds.times(80));
    }

    var spentHS = calculator.calculate();

    display(spentHS);
    generateSaveGame(spentHS);
}

function manualHeroSoulEntry() {
    data.useSoulsEnteredManually = true;
    calculateAndUpdate();
}

function display(spentHS) {
    $("#soulsgoal").text(utils.numberToStringFormatted(data.heroSouls.minus(spentHS).floor()));
    $("#soulschange").text((spentHS > 0 ? "-" : "") + utils.numberToStringFormatted(spentHS));

    for (var k in data.ancients) {
        var ancient = data.ancients[k];
        if (ancient.extraInfo.optimalLevel) {
            ancient.ui.goal.text(utils.numberToStringFormatted(ancient.extraInfo.optimalLevel));
            ancient.ui.change.val(utils.numberToStringFormatted(ancient.extraInfo.optimalLevel.minus(ancient.level)));
            ancient.ui.cost.text(utils.numberToStringFormatted(ancient.extraInfo.costToLevelToOptimal));

            ancient.ui.targetBox.attr("style","display:auto;");

        } else {
            ancient.ui.targetBox.attr("style","display:none");
        }
    }
    
    $("#ancienttbl tr:visible").each(function (index, row) {
        $(row).removeClass('odd_row');
        if (index % 2 == 1) { //odd row
            $(row).addClass('odd_row');
        }
    });

    initializeAncientSoulPlanner();
    ancientSoulPlanner();
}

function initializeAncientSoulPlanner() {
    var table = $('.as-planner table');
    table.find('tbody').empty();
    table.data('as', 0);
}

function ancientSoulPlanner(add) {
    // add = 20 default
    add = utils.defaultFor(add, 20);

    var table = $('.as-planner table');

    // AS = floor(5 * log10(HS))
    var curAS = data.heroSoulsSacrificed.log(10).times(5).floor();

    var hs = data.totalHSEarned;
    if (data.settings.includeSoulsAfterAscension) {
        hs = hs.plus(data.ascensionSouls);
    }

    var curASGain = hs.log(10).times(5).floor().minus(curAS);
    var plannedTo = table.data('as');

    for (var n = 1; n <= add; n++) {
        var planTo = curASGain.plus(plannedTo).plus(n);
        var totalAS = planTo.plus(curAS);

        // HS = 10^(AS / 5)
        var cost = Decimal.pow(10, totalAS.dividedBy(5)).minus(hs);

        var deltaCost = cost;
        if (n > 1) {
            var deltaCost = deltaCost.minus(Decimal.pow(10, totalAS.minus(1).dividedBy(5)).minus(hs));
        }

        table.find('tbody:last-child').append('<tr>\
            <td>+' + planTo + ' AS</td>\
            <td>' + utils.numberToStringFormatted(cost, 4) + ' HS</td>\
            <td>' + utils.numberToStringFormatted(deltaCost, 4) + '</td>\
            </tr>'
        );

    }

    table.data('as', plannedTo + add);
}

// Bind to the AS planner window scroll event to add more rows when we
// (nearly) reach the bottom of the window
jQuery(function ($) {
    $('.as-planner').on('scroll', function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 20) {
            ancientSoulPlanner(5);
        }
    })
});

function generateSaveGame(spentHS) {
    // Only do this if save-game generation is enabled.
    if (!$('#displaysavegamegeneration').prop('checked')) {
        return;
    }

    // Only do this if the user did not enter souls manually 
    // and the user is not including souls that would be gained
    // after ascending.
    if (data.useSoulsEnteredManually
        || data.settings.includeSoulsAfterAscension) {
        $('#generatedsavedata').val("Won't generate save-game when 'Include souls gained after ascension' is ticked or hero souls are entered manually.");
        return;
    }

    var rawDataAlgo = utils.decodeSaveGame($("#savedata").val());
    var rawData = rawDataAlgo.data;

    // Set ancient levels
    for (var k in data.ancients) {
        var ancient = data.ancients[k];
        if (ancient.extraInfo.optimalLevel) {
            rawData.ancients.ancients[ancient.id].level = ancient.extraInfo.optimalLevel.floor().toString();
            rawData.ancients.ancients[ancient.id].spentHeroSouls = new Decimal(rawData.ancients.ancients[ancient.id].spentHeroSouls).plus(ancient.extraInfo.costToLevelToOptimal).toString();
        }
    }

    // Set hero soul count
    rawData.heroSouls = data.heroSouls.minus(spentHS).floor().toString();

    // Output save game
    $('#generatedsavedata').val(utils.encodeSaveGame(rawData, data.encodeAlgo));
}
