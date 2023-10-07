/**
 * ### GET `/api/search` request
 *
 * @header Authorization
 */
interface SearchRequest {
  query: {
    /** Amount of uploads to show per page. */
    quantity?: string;
    /** Page number. */
    page?: string;
    /** Filename query. */
    filename?: string;
    /** Username as a filter. */
    username?: string;
  };
}

/**
 * ### GET `/api/search` success response
 */
type SearchResponse = GetFileResponse[];
