```js
Fraction {
  num: Summation {
    terms: [
      PowerFactorisation { /* ... */ },
      Mult {
        a: Summation {
          terms: [
            PowerFactorisation { /* ... */ },
            Mult {
              a: Summation {
                terms: [
                  PowerFactorisation { /* ... */ },
                  Mult {
                    a: Summation {
                      terms: [
                        PowerFactorisation { /* ... */ },
                        Mult {
                          a: Mult { // open
                            a: Power {
                              base: Int { x: 2 },
                              exponent: Int { x: 58 }
                            },
                            b: Mult {
                              a: Power {
                                base: Int { x: 2 },
                                exponent: Int { x: 6 }
                              },
                              b: Summation {
                                terms: [
                                  PowerFactorisation {
                                    factors: {
                                      '2': 51,
                                      '3': 2,
                                      '404017667756303': 1
                                    },
                                    sign: 1
                                  },
                                  PowerFactorisation {
                                    factors: {
                                      '5': 2,
                                      '1080863910568919': 1,
                                      '3002399751580331': 1
                                    },
                                    sign: 1
                                  }
                                ]
                              }
                            }
                          }, // close
                          b: Power {
                            base: Int { x: 2 },
                            exponent: Int { x: 61 }
                          }
                        }
                      ]
                    },
                    b: Power {
                      base: Int { x: 2 },
                      exponent: Int { x: 61 }
                    }
                  }
                ]
              },
              b: Power { base: Int { x: 2 }, exponent: Int { x: 59 } }
            }
          ]
        },
        b: Power { base: Int { x: 2 }, exponent: Int { x: 62 } }
      }
    ]
  },
  den: Mult { /* ... */ }
}
```
