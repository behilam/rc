use nvim_oxi as oxi;

#[oxi::module]
pub fn foo() -> oxi::Result<u32> {
    Ok(42)
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[oxi::test]
//     fn it_works() {
//         let result = foo();
//         assert_eq!(result, Ok(42));
//     }
// }
