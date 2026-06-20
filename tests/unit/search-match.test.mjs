import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    levenshtein,
    maxEditDistance,
    matchTermInText,
    scoreTermAgainstFields,
    scoreSearchEntry
} from '../../js/modules/search-match.mjs';

describe('levenshtein', () => {
    it('returns 0 for identical strings', () => {
        assert.equal(levenshtein('music', 'music'), 0);
    });

    it('returns 1 for single-character substitution', () => {
        assert.equal(levenshtein('msic', 'music'), 1);
    });

    it('returns 1 for single-character insertion/deletion', () => {
        assert.equal(levenshtein('phots', 'photo'), 1);
        assert.equal(levenshtein('phot', 'photo'), 1);
    });
});

describe('maxEditDistance', () => {
    it('allows no fuzzy match for very short terms', () => {
        assert.equal(maxEditDistance('ab'), 0);
    });

    it('allows distance 1 for medium terms', () => {
        assert.equal(maxEditDistance('msic'), 1);
    });

    it('allows distance 2 for long terms', () => {
        assert.equal(maxEditDistance('transferr'), 2);
    });
});

describe('matchTermInText', () => {
    it('matches exact substring in title', () => {
        var result = matchTermInText('Music Player', 'music');
        assert.equal(result.matched, true);
        assert.equal(result.fuzzy, false);
        assert.equal(result.prefix, true);
    });

    it('fuzzy-matches typo msic to music', () => {
        var result = matchTermInText('Music Player', 'msic');
        assert.equal(result.matched, true);
        assert.equal(result.fuzzy, true);
    });

    it('fuzzy-matches phots to photo keyword text', () => {
        var result = matchTermInText('image lightbox gallery photo zoom', 'phots');
        assert.equal(result.matched, true);
        assert.equal(result.fuzzy, true);
    });

    it('does not fuzzy-match unrelated short terms', () => {
        var result = matchTermInText('Button', 'xy');
        assert.equal(result.matched, false);
    });

    it('does not match nonsense strings', () => {
        var result = matchTermInText('Music Player', 'xyznonexistentsearchtermxyz');
        assert.equal(result.matched, false);
    });
});

describe('scoreTermAgainstFields', () => {
    it('scores exact title match higher than fuzzy title match', () => {
        var fields = { title: 'Music Player', category: 'Carousel & Media', keywords: 'music player audio' };
        var exactScore = scoreTermAgainstFields(fields, 'music');
        var fuzzyScore = scoreTermAgainstFields(fields, 'msic');
        assert.ok(exactScore > fuzzyScore);
    });

    it('scores keyword fuzzy match', () => {
        var fields = { title: 'Image Box', category: 'Carousel & Media', keywords: 'image lightbox gallery photo zoom' };
        var score = scoreTermAgainstFields(fields, 'phots');
        assert.ok(score >= 20);
    });
});

describe('scoreSearchEntry', () => {
    it('scores music player entry for typo msic', () => {
        var entry = {
            title: 'Music Player',
            category: 'Carousel & Media',
            keywords: 'music player audio'
        };
        assert.ok(scoreSearchEntry(entry, ['msic']) > 0);
    });

    it('scores image box entry for typo phots via keywords', () => {
        var entry = {
            title: 'Image Box',
            category: 'Carousel & Media',
            keywords: 'image lightbox gallery photo zoom'
        };
        assert.ok(scoreSearchEntry(entry, ['phots']) > 0);
    });

    it('returns 0 for nonsense query', () => {
        var entry = {
            title: 'Music Player',
            category: 'Carousel & Media',
            keywords: 'music player audio'
        };
        assert.equal(scoreSearchEntry(entry, ['xyznonexistentsearchtermxyz']), 0);
    });

    it('ranks exact query above typo for same entry', () => {
        var entry = {
            title: 'Music Player',
            category: 'Carousel & Media',
            keywords: 'music player audio'
        };
        assert.ok(scoreSearchEntry(entry, ['music']) > scoreSearchEntry(entry, ['msic']));
    });
});

describe('sidebar nav label matching', () => {
    it('matches Music Player label for typo msic', () => {
        assert.equal(matchTermInText('Music Player', 'msic').matched, true);
    });

    it('matches Image Box label for typo imag', () => {
        assert.equal(matchTermInText('Image Box', 'imag').matched, true);
    });

    it('does not match nonsense against nav labels', () => {
        assert.equal(matchTermInText('Music Player', 'xyznonexistentsearchtermxyz').matched, false);
    });
});
