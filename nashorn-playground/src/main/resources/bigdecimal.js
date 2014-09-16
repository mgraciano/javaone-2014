var BigDecimal = Java.type("java.math.BigDecimal");

numbersCalcExperimentation();

function numbersCalcExperimentation() {
    // IEEE 754
    var value = 0.1 + 0.2;
    print('JS result of 0.1 + 0.2: ' + value);

    print('BigDecimal result of 0.1 + 0.2: ' + BigDecimal.valueOf('0.1')
            .add(BigDecimal.valueOf('0.2')));
}
