export const SECTIONS_BASE = './sections/';
export const DOCS_CONTENT_VERSION = '1.5.0-docs-8';

export const loadedSections = new Set();
export const loadingSections = new Set();
export const sectionPrefetching = new Set();

// Cache of each section's last measured rendered height (px), keyed by section id.
// Sections use content-visibility:auto with a small contain-intrinsic-size
// fallback; a tall section (a stacked demo page) would otherwise reserve far too
// little space, so a fast scroll that backfills it lurches ~its full height as it
// renders/skips. Reserving the real height up front keeps the box stable. The
// heights stay valid across section teardown, so this is not cleared on reset.
export const docSectionHeights = new Map();

export const state = {
    registry: { pages: [], tabs: {} },
    scrollSpyObserver: null,
    sectionSizeObserver: null,
    docTopBoundaryObserver: null,
    docBottomBoundaryObserver: null,
    docTopBoundaryEl: null,
    docBottomBoundaryEl: null,
    currentView: null,
    currentTab: null,
    scrollSpyTicking: false,
    activeDocSectionId: null,
    pendingDocNavigationId: null,
    pendingDocNavigationReleaseTimer: null,
    docScrollLoaderEl: null,
    docScrollLoaderTargetId: null,
    docScrollLoaderFallbackTimer: null,
    requestedDocScrollLoaderSectionId: null,
    currentNavigationController: null,
    docTopBoundaryArmed: false,
    docBottomBoundaryArmed: false,
    docBoundaryPrevLoading: false,
    docBoundaryNextLoading: false,
    docLastKnownScrollY: window.scrollY || window.pageYOffset || 0,
    docContentEpoch: 0,
    docNavigationSettleGeneration: 0,
    docProgrammaticScroll: false,
    docProgrammaticScrollTimer: null,
    docExplicitNavCooldownUntil: 0,
    docExplicitNavSectionId: null,
    docPendingNavigationStartedAt: 0,
    docNavSuppressBoundaryScroll: false
};

export const DOC_USER_SCROLL_CANCEL_THRESHOLD = 8;
export const DOC_EXPLICIT_NAV_COOLDOWN_MS = 1500;
export const DOC_TOP_BOUNDARY_SENTINEL_ID = 'docs-scroll-top-sentinel';
export const DOC_BOTTOM_BOUNDARY_SENTINEL_ID = 'infinite-scroll-sentinel';
export const DOC_BOUNDARY_ROOT_MARGIN = '400px 0px 400px 0px';
export const DOC_NEIGHBOR_PREFETCH_RADIUS = 1;
export const DOC_RUNWAY_BOTTOM_THRESHOLD = 48;
export const SCROLL_SPY_OFFSET = 96;
export const ACTIVE_DOC_SECTION_TOLERANCE = 24;
