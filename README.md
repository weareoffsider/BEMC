BEMC
====

Block Element Modifier Context

### Key concepts
- Lintable
- Low but manageable selector specificity
- BEM + context syntax
- .context* classes for context/region changes that effect arbitrary child elements
- .is- classes for states
- .has- classes for encapsulation


### Example
````less 
.block {}

.block__element {}

.block--modifier {}

.context\* {
  .block {
    // context specific overrides
  }
}
````


### Rules

Block elements are modified by the parent element's modifier class. 
````
.block--stretch .block__title {
  width: 100%;
}
````

State and encapsulation classes are the exception.
```` 
// State
.block.is-visible {}


// Encapsulation
.has-block--sticky {
  position: relative;
  padding-top: 4em;
}

.block--sticky {
  position: fixed;
}

````





### NOT Allowed

Unnecessary specificity:
````
.block.block--stretch {}
.block.block--stretch .block__element {}
````


### Notes

It's perfectly reasonable for block and context classes to sit together:
````
<header class="header header*">
  ...
</header>
````
