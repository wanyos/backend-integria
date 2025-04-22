const QUERIES = {
  allObjectCount: `
     select count(*) as total from tinventory where id_object_type=?;
  `,

  allStatusLinesCount: `
    select count(*) as total from tinventory where id_object_type=? and status=?;
  `,

  allErrorStatusLinesCount: `
     select count(*) as total from tinventory where id_object_type=? and status not in (?,?);
  `,
};

export default QUERIES;
