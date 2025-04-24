const QUERIES = {
  allObjectCount: `
     select count(*) as total from tinventory where id_object_type=?;
  `,

  allStatusLinesCount: `
    select count(*) as total from tinventory where id_object_type=? and status=?;
  `,

  allErrorStatusLines: `
     select id, owner, name, description, 
     DATE_FORMAT(last_update, '%d-%m-%Y') AS last_update,
     status, 
      DATE_FORMAT(receipt_date, '%d-%m-%Y') AS receipt_date,
      DATE_FORMAT(issue_date, '%d-%m-%Y') AS issue_date 
      from tinventory where id_object_type=? and status not in (?,?);
  `,
};

export default QUERIES;
