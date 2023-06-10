/** Single view type */
interface ViewResponse {
  /** Upload creation date */
  created_at: Date;
  /** Amount of views for the upload */
  views: number;
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
