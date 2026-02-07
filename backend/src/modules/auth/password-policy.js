const policy = {
    minLength: 10,
    requireUpper: true,
    requireLower: true,
    requireNumber: true,
    requireSymbol: true,
};

function validatePasswordStrength(password) {
    const issues = [];

    if (password.length < policy.minLength) {
        issues.push(`Minimo de ${policy.minLength} caracteres`);
    }

    if (policy.requireUpper && !/[A-Z]/.test(password)) {
        issues.push('Pelo menos uma letra maiuscula');
    }

    if (policy.requireLower && !/[a-z]/.test(password)) {
        issues.push('Pelo menos uma letra minuscula');
    }

    if (policy.requireNumber && !/[0-9]/.test(password)) {
        issues.push('Pelo menos um numero');
    }

    if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
        issues.push('Pelo menos um simbolo');
    }

    return {
        isValid: issues.length === 0,
        issues,
    };
}

module.exports = {
    policy,
    validatePasswordStrength,
};
