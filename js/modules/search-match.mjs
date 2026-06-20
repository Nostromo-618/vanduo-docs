/**
 * Pure fuzzy matching helpers for docs global search.
 * No DOM dependencies — safe to unit-test under Node.
 */

var WORD_SPLIT = /[\s\-_/]+/;

export function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var prev = new Array(b.length + 1);
    var curr = new Array(b.length + 1);

    for (var j = 0; j <= b.length; j++) {
        prev[j] = j;
    }

    for (var i = 1; i <= a.length; i++) {
        curr[0] = i;
        for (var k = 1; k <= b.length; k++) {
            var cost = a[i - 1] === b[k - 1] ? 0 : 1;
            curr[k] = Math.min(
                curr[k - 1] + 1,
                prev[k] + 1,
                prev[k - 1] + cost
            );
        }
        var swap = prev;
        prev = curr;
        curr = swap;
    }

    return prev[b.length];
}

export function maxEditDistance(term) {
    if (term.length <= 2) return 0;
    if (term.length <= 6) return 1;
    return 2;
}

function splitWords(text) {
    return text.toLowerCase().split(WORD_SPLIT).filter(function (w) { return w.length > 0; });
}

function fuzzyWordMatch(term, word, maxDist) {
    if (maxDist === 0) return false;
    if (Math.abs(term.length - word.length) > maxDist) return false;
    return levenshtein(term, word) <= maxDist;
}

/**
 * Match a query term against a text field (title, category, or keywords).
 * Returns { matched, fuzzy, exact, prefix }.
 */
export function matchTermInText(text, term) {
    if (!text || !term) {
        return { matched: false, fuzzy: false, exact: false, prefix: false };
    }

    var textLower = text.toLowerCase();
    var termLower = term.toLowerCase();

    if (textLower.includes(termLower)) {
        return {
            matched: true,
            fuzzy: false,
            exact: textLower === termLower,
            prefix: textLower.startsWith(termLower) && textLower !== termLower
        };
    }

    var maxDist = maxEditDistance(termLower);
    if (maxDist === 0) {
        return { matched: false, fuzzy: false, exact: false, prefix: false };
    }

    var words = splitWords(text);
    for (var i = 0; i < words.length; i++) {
        if (fuzzyWordMatch(termLower, words[i], maxDist)) {
            return { matched: true, fuzzy: true, exact: false, prefix: false };
        }
    }

    return { matched: false, fuzzy: false, exact: false, prefix: false };
}

var DEFAULT_WEIGHTS = {
    title: { base: 100, exact: 50, prefix: 25, fuzzy: 60 },
    category: { base: 50, fuzzy: 30 },
    keywords: { base: 30, fuzzy: 20 }
};

/**
 * Score a single query term against title, category, and keywords fields.
 */
export function scoreTermAgainstFields(fields, term, weights) {
    var w = weights || DEFAULT_WEIGHTS;
    var score = 0;

    var titleMatch = matchTermInText(fields.title, term);
    if (titleMatch.matched) {
        if (titleMatch.fuzzy) {
            score += w.title.fuzzy;
        } else {
            score += w.title.base;
            if (titleMatch.exact) score += w.title.exact;
            else if (titleMatch.prefix) score += w.title.prefix;
        }
    }

    var catMatch = matchTermInText(fields.category, term);
    if (catMatch.matched) {
        score += catMatch.fuzzy ? w.category.fuzzy : w.category.base;
    }

    var kwMatch = matchTermInText(fields.keywords, term);
    if (kwMatch.matched) {
        score += kwMatch.fuzzy ? w.keywords.fuzzy : w.keywords.base;
    }

    return score;
}

export function scoreSearchEntry(entry, terms, weights) {
    var score = 0;
    var fields = {
        title: entry.title,
        category: entry.category,
        keywords: entry.keywords
    };

    terms.forEach(function (term) {
        score += scoreTermAgainstFields(fields, term, weights);
    });

    if (entry.category === 'Pages' && score > 0) {
        score += 5;
    }

    return score;
}
