/** Single view type */
interface ViewResponse {
  /** View creation date */
  created_at: Date;
}

/**
 * ### GET `/api/views` request
 * 
 * @header Authorization
 */
interface GetViewsRequest {
  query: {
    /** Less than. */
    lt?: string;
    /** Less than or equal to. */
    lte?: string;
    /** Greater than. */
    gt?: string;
    /** Greater than or equal to. */
    gte?: string;
    /** Specified user to get views from. */
    username?: string;
  }
};

/**
 * ### GET `/api/views` success response
 */
type GetViewsResponse = ViewResponse[];
