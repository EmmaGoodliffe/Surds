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
                          a: Summation { // open
                            terms: [
                              PowerFactorisation {
                                factors: {
                                  '2': 58,
                                  '18014398509481984': 1,
                                  '29089272078453816': 1
                                },
                                sign: 1
                              },
                              Mult {
                                a: Summation {
                                  terms: [
                                    PowerFactorisation {
                                      factors: {
                                        '2': 57,
                                        '3': 4,
                                        '5': 2,
                                        '7': 1,
                                        '1140494844623': 1
                                      },
                                      sign: 1
                                    },
                                    PowerFactorisation {
                                      factors: {
                                        '2': 56,
                                        '3': 1,
                                        '1231922724633973': 1
                                      },
                                      sign: 1
                                    }
                                  ]
                                },
                                b: Power {
                                  base: Int { x: 2 },
                                  exponent: Int { x: 59 }
                                }
                              }
                            ]
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
