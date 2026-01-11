import cookidoo_api
import inspect

print("Dir of cookidoo_api:")
print(dir(cookidoo_api))

if hasattr(cookidoo_api, 'Cookidoo'):
    print("\nDir of Cookidoo class:")
    print(dir(cookidoo_api.Cookidoo))
    
    print("\nSignature of Cookidoo.__init__:")
    print(inspect.signature(cookidoo_api.Cookidoo.__init__))

    if hasattr(cookidoo_api.Cookidoo, 'login'):
        print("\nSignature of Cookidoo.login:")
        print(inspect.signature(cookidoo_api.Cookidoo.login))

    if hasattr(cookidoo_api.Cookidoo, 'add_custom_recipe_from'):
        print("\nSignature of Cookidoo.add_custom_recipe_from:")
        print(inspect.signature(cookidoo_api.Cookidoo.add_custom_recipe_from))

    if hasattr(cookidoo_api.Cookidoo, 'get_custom_recipe'):
        print("\nSignature of Cookidoo.get_custom_recipe:")
        print(inspect.signature(cookidoo_api.Cookidoo.get_custom_recipe))

else:
    print("Cookidoo class not found in cookidoo_api")
