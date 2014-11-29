var _ = require("lodash");

var bemcStepHasHTMLTag = function(step) {
  return !!step.htmlTag;
}

var bemcStepIsContext = function(step) {
  return !step.htmlTag && step.bemc[0] && step.bemc[0].type == "context"
}


module.exports.htmlTags = function(bemc, manifest) {
  var htmlIx = _.findIndex(bemc.steps, bemcStepHasHTMLTag);
  var contextIx = _.findIndex(bemc.steps, bemcStepIsContext);

  htmlSteps = bemc.steps.filter(function(bemc) {
    return !!bemc.htmlTag;
  });

  classedSteps = bemc.steps.filter(function(bemc) {
    return bemc.bemc.length > 0;
  });

  if (
    htmlIx == 0 && (classedSteps.length > 0)
  ) {
    throw new Error(
      "HTML Tag may not be used in combination with classes unless inside a context"
    );
  }

  if (htmlIx > 1 && (htmlIx < contextIx || contextIx == -1)) {
    throw new Error(
      "HTML Tag not to be used unless without a class or inside a context"
    );
  }
}

module.exports.blockExists = function(bemc, manifest) {
  bemc.steps.forEach(function(bemcStep) {
    bemcStep.bemc.forEach(function(bemc) {
      if (_.contains(["element", "modifier"], bemc.type)) {
        if (!_.contains(manifest.blocks, bemc.block)) {
          throw new Error(
            "You can't create a " + bemc.type + " for a block that doesn't " +
            "exist: '" + bemc.block + "'"
          );
        };
      };
    });
  });
}

module.exports.encapsulationPossible = function(bemc, manifest) {
  bemc.steps.forEach(function(bemcStep) {
    bemcStep.bemc.forEach(function(bemc) {
      if (_.contains(["encapsulation"], bemc.type)) {
        var matches = manifest.blocks.concat(manifest.modifiers);
        if (!_.contains(matches, bemc.encapsulates)) {
          throw new Error(
            "'has' selector must match a block or block modifier, e.g. " +
            "'has-' + (blockName || blockName + modifier)"
          );
        }
      };
    });
  });
}


module.exports.contextExists = function(bemc, manifest) {
  bemc.steps.forEach(function(bemcStep) {
    bemcStep.bemc.forEach(function(bemc) {
      if (_.contains(["context-modifier"], bemc.type)) {
        if (!_.contains(manifest.contexts, bemc.context)) {
          throw new Error(
            "You can't create a context modifier for a context that doesn't " +
            "exist: '" + bemc.context + "'"
          );
        };
      };
    });
  });
}

var getTypesFromStep = function(bemcStep) {
  return bemcStep.bemc.map(function(bemc) { return bemc.type });
};

module.exports.unnecessarySpecifity = function(bemc, manifest) {
  var specificityError = function(message) {
    throw new Error("Unnecessary Specificity: " + message);
  };

  var hadBlock = false;
  var hadState = false;

  bemc.steps.forEach(function(bemcStep) {
    var types = getTypesFromStep(bemcStep);
    var hasBlock = _.contains(types, "block");
    var hasState = _.contains(types, "state");
    hadBlock = hadBlock || hasBlock;
    hadState = hadState || hasState
    var hasModifier = _.contains(types, "modifier");
    var hasElement = _.contains(types, "element");
    var hasContext = _.contains(types, "context");
    var hasContextModifier = _.contains(types, "context-modifier");

    if (hadBlock && hasElement && !hadState) {
      specificityError("Elements do not require blocks in their selector");
    }

    if (hasContext && hasContextModifier) {
      specificityError("A context modifier does not also need a context");
    }

    if (hasBlock && hasModifier) {
      specificityError("A block modifier does not also need a block");
    }
  });
};



module.exports.stateRules = function(bemc, manifest) {
  bemc.steps.forEach(function(bemcStep) {
    var types = getTypesFromStep(bemcStep);
    var hasBlock = _.contains(types, "block");
    var hasModifier = _.contains(types, "modifier");
    var hasElement = _.contains(types, "element");
    var hasState = _.contains(types, "state");
    var hasContext = _.contains(types, "context");
    var hasContextModifier = _.contains(types, "context-modifier");

    if (hasElement && hasState) {
      throw new Error(
        "State classes can only be used with blocks and modifiers"
      );
    }
  });
};


