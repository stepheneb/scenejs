function equalFloat(a, b, decimals) {
    if (!decimals) decimals = 3;
    var multiplier = Math.pow(10,decimals); 
    a = Math.round(a * multiplier); 
    b = Math.round(b * multiplier);
    return (a == b);
}

beforeEach(function() {
    this.addMatchers({
        toEqualFloat: function(a, b, decimals) {
            equalFloat(a, b, decimals)
        },
        toEqualLook: function(look, decimals) {
            if (!decimals) decimals = 3;
            return equalFloat(this.actual.x, look.x, decimals) &&
            equalFloat(this.actual.y, look.y, decimals) &&
            equalFloat(this.actual.z, look.z, decimals);
        }
    })
});
