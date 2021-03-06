var postcss = require("postcss");
var _ = require("lodash");
var rules = require("./rules.js");

var isRule = function(css) { return css.type == "rule"; };
var isBlock = function(css) {
  var selector = css.selector;

  return isRule(css) &&
         css.selector.split("__").length == 1 &&
         css.selector.split("--").length == 1 &&
         css.selector.split("\*").length == 1 &&
         css.selector.split(" ").length == 1 &&
         !css.selector.split(".")[0] &&
         css.selector.split(".").length == 2;
};

var isContext = function(css) {
  var selector = css.selector;

  return isRule(css) &&
         css.selector.split("__").length == 1 &&
         css.selector.split("--").length == 1 &&
         css.selector.split("\*").length == 2 &&
         css.selector.split(" ").length == 1 &&
         !css.selector.split(".")[0] &&
         css.selector.split(".").length == 2;
};

var getClassType = function(className) {
  if (className.indexOf("is-") == 0) {
    return "state";
  } else if (className.indexOf("has-") == 0) {
    return "encapsulation";
  } else if (className.split("\\*--").length == 2) {
    return "context-modifier";
  } else if (className.split("\\*").length == 2) {
    return "context";
  } else if (className.split("__").length == 2) {
    return "element";
  } else if (className.split("--").length == 2) {
    return "modifier";
  } else if (className.split(":").length == 2) {
    return "pseudo-modifier";
  } else {
    return "block";
  }
};

var identifyClass = function(className) {
  var type = getClassType(className);
  switch (type) {
    case "state":
      return {
        type: type,
        full: className,
        state: className.split("is-")[1]
      };
      break;

    case "encapsulation":
      return {
        type: type,
        full: className,
        encapsulates: className.split("has-")[1]
      };
      break;

    case "context":
      return {
        type: type,
        full: className,
        contextName: className
      };
      break;

    case "context-modifier":
      var split = className.split("--");
      return {
        type: type,
        full: className,
        modifier: split[1],
        context: split[0]
      };
      break;

    case "element":
      var split = className.split("__");
      return {
        type: type,
        full: className,
        element: split[1],
        block: split[0]
      };
      break;

    case "modifier":
      var split = className.split("--");
      return {
        type: type,
        full: className,
        modifier: split[1],
        block: split[0]
      };
      break;

    case "pseudo-modifier":
      var split = className.split(":");
      return {
        type: type,
        full: className,
        pseudo: split[1],
        block: split[0]
      };
      break;

    case "block":
      return {
        type: type,
        full: className,
        block: className
      };
      break;
  };

}

var bemcify = function(css) {
  var bemcSelectors = css.selector.split(",");

  return bemcSelectors.map(function(selector) {
    selector = selector.trim();
    var steps = selector.split(" ");
    return {
      selector: selector,
      line: css.source.start.line,
      steps: steps.map(function(step) {
        var classes = step.split(".");
        var htmlTag = classes[0];
        var bemcClasses = classes.slice(1);
        return {
          htmlTag: htmlTag,
          bemc: bemcClasses.map(identifyClass),
        };
      })
    }

  });


};

var bemcStepHasHTMLTag = function(step) {
  return !!step.htmlTag;
}

var bemcStepIsContext = function(step) {
  return !step.htmlTag && step.bemc[0] && step.bemc[0].type == "context"
}


var validate = function(bemc, manifest, activeRules) {

  // HTML Tag Rule
  activeRules.forEach(function(key) {
    var rule = rules[key]
    try {
      rule(bemc, manifest);
    } catch (error) {
      console.warn(
        "Line " + bemc.line + ": " + bemc.selector + "\n" +
        error.message + "\n"
      );
    }

  });

}

var bemcOn = true;

var walkTree = function(css, lintNodes) {
  if (!css.nodes) return;
  css.nodes.forEach(function (cssChild) {
    if (isRule(cssChild) && bemcOn) {
      lintNodes.push(cssChild);
    };

    if (cssChild.type == "atrule") {
      walkTree(cssChild, lintNodes);
    }

    if (cssChild.type == "comment") {
      if (cssChild.text.trim() == "bemc: off") {
        bemcOn = false;
      } else if (cssChild.text.trim() == "bemc: on") {
        bemcOn = true;
      }
    }
  });
}


var BEMCLinter = postcss.plugin('BEMCLinter', function BEMCLinter (opts) {
  opts = opts || []

  var lintNodes = []
  var activeRules = Object.keys(rules)

  if (opts.rules) {
    Object.keys(opts.rules).forEach(function(key) {
      var active = opts.rules[key]
      if (!active) {
        var ruleIx = activeRules.indexOf(key)
        activeRules.splice(ruleIx, 1)
      }
    })
  }

  return function (css) {
    walkTree(css, lintNodes);

    var bemcSelectors = _.flatten(lintNodes.map(bemcify), true);

    var manifest = {};

    ["block", "context", "modifier"].forEach(function(type) {
      var ofType = _.uniq(_.flatten(bemcSelectors.map(function(bemcSelector) {
        return bemcSelector.steps.map(function(bemcStep) {
          return bemcStep.bemc.filter(function(bemc) {
            return bemc.type == type;
          }).map(function(bemc) {
            return bemc.full;
          });
        });
      })));

      manifest[type + "s"] = ofType
    });

    bemcSelectors.forEach(function(bemcSelector) {
      validate(bemcSelector, manifest, activeRules);
    });
  }
});

module.exports = BEMCLinter;
