/** Single view type */
interface ViewResponse {
  /** View creation date */
  created_at: Date;
}

/**
 * ### GET `/api/views` success response
 * 
 * @header Authorization
 * @param {string?} lt - Less than
 * @param {string?} lte - Less than or equal to
 * @param {string?} gt - Greater than
 * @param {string?} gte - Greater than or equal to
 */
type GetViewsResponse = ViewResponse[];
