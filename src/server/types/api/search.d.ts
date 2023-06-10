/**
 * ### GET `/api/search` success response
 * 
 * @header Authorization
 * @param {string?} quantity - Amount of uploads to show per page
 * @param {string?} page - Page number
 * @param {string?} query - Search Query
 */
type SearchResponse = GetFileResponse[];