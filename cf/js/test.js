generate_completion <- function(prompt) {
  tryCatch({
    response <- httr::POST(
      url = "https://api.openai.com/v1/engines/davinci/completions",
      httr::add_headers(`Authorization` = paste("Bearer", api_key)),
      httr::content_type("application/json"),
      body = list(
        prompt = prompt,
        max_tokens = 60,
        temperature = 0.7,
        n = 1
      ),
      encode = "json"
    )
    
    handle_api_errors(response)
    
    response <- httr::content(response)
    return(response$choices[[1]]$text)
  }, error = function(e) {
    # Handle API request errors
    cat("Error:", conditionMessage(e), "\n")
    return(NULL)
  })
}
